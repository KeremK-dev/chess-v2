const BOARD_DOM = document.getElementById('app');

const ROW = 8;
const COL = 8;
const SQUARE_SIZE = 50;
const BOARD_BORDER = 10;

const siyah = 'b';
const beyaz = 'w';

// isimler
const piyon = 'piyon';
const kale = 'kale';
const at = 'at';
const fil = 'fil';
const vezir = 'vezir';
const sah = 'sah';

// tas ikonları
const s_piyon = '&#9823;';
const b_pion = '&#9817;';
const s_kale = '&#9820;';
const b_kale = '&#9814;';
const s_at = '&#9822;';
const b_at = '&#9816;';
const s_fil = '&#9821;';
const b_fil = '&#9815;';
const s_vezir = '&#9819;';
const b_vezir = '&#9813;';
const s_sah = '&#9818;';
const b_sah = '&#9812;';

// ---------------------------------------------------
// dewiskenler
// ---------------------------------------------------
var isMoving = null;
var turnDom = document.getElementById('turn');

// ---------------------------------------------------

function createBoard(row, col) {
  var arr = [];
  for (var i = 0; i < row; i++) {
    var rowArr = [];
    for (var j = 0; j < col; j++) {
      var value = true;
      if (i % 2 === 0) value = !value;
      if (j % 2 === 0) value = !value;
      rowArr.push({ piece: null, background: value });
    }
    arr.push(rowArr);
  }
  return arr;
}

function olusmakBoard() {
  var boardHTML = this.board.reduce(function(acc, item, index) {
    var row = ''
    item.forEach(function (element, idx) {
      var pieceisim, color, id, player = '';
      var classValue = element.background ? 'grey' : 'white';

      if (element.piece) {
        pieceisim = element.piece.isim;
        color = element.piece.color;
        id = 'data-piece=' + element.piece.id;
        player = 'data-player=' + color;
      }
      
      row += 
        '<div data-x=' + idx + ' class="' + classValue + '">' +          
            buildPiece(pieceisim, color, id , player) + 
        '</div>';
    })
    return acc += '<div data-y=' + index + ' class="row">' + row + '</div>';
  }, '');  
  BOARD_DOM.innerHTML = boardHTML;
}

function buildPiece(isim, color, id , player) {
  value = '';
  if (!isim) return value;

  //renk verme!!!
  
  if (isim === piyon) value = color === siyah ? s_piyon : b_pion;
  if (isim === kale) value = color === siyah ? s_kale : b_kale;
  if (isim === at) value = color === siyah ? s_at : b_at;
  if (isim === fil) value = color === siyah ? s_fil : b_fil;
  if (isim === vezir) value = color === siyah ? s_vezir : b_vezir;
  if (isim === sah) value = color === siyah ? s_sah : b_sah;
  
  return '<div ' + id + ' ' + player + ' class="game-piece">' + value + '</div>';
}

function GamePiece(x, y, isim, color, count) {
  this.isim = isim;
  this.color = color;
  this.x = x;
  this.y = y;
  this.id = isim + count + color;
  this.move(); // bu parçayı tahtaya yerleştirecek
  game.pieces[this.id] = this; // Kolay erişim için tüm parçaları bir arada tutun
}

GamePiece.prototype.move = function() {
  game.board[this.y][this.x].piece = this;
  game.olusmak();
}

GamePiece.prototype.guncelleme = function(x, y) {
  if (isMoveAllowed(this, x, y)) {
    this.x = x;
    this.y = y;
    this.move();
    game.olusmak();
    game.guncellemeTurn(); 
  } else {
    this.geri_gitme();
  }
}

GamePiece.prototype.geri_gitme = function() {
  this.move();
}

function isMoveAllowed(obj, x, y) {
  var hamle_izin = false;
  
  if (obj.isim === piyon) hamle_izin = checkpiyonRules(obj, x, y);
  if (obj.isim === kale) hamle_izin = checkkaleRules(obj, x, y);
  if (obj.isim === at) hamle_izin = checkatRules(obj, x, y);
  if (obj.isim === fil) hamle_izin = checkfilRules(obj, x, y);
  if (obj.isim === vezir) hamle_izin = checkvezirRules(obj, x, y);
  if (obj.isim === sah) hamle_izin = checksahRules(obj, x, y);
  
  return hamle_izin;
}
//piyon
function checkpiyonRules (obj, x, y) {
  var ilkY = obj.color === siyah ? 1 : 6;
  var carp_deger = carp_ctrl(x, y);
  var sonuc = true;

  // duz hareket etmek
  if (obj.x !== x) sonuc = false;

  //onundekini almamak
  if (obj.x === x && carp_deger &&
      carp_deger.color !== obj.color) sonuc = false;

  if (obj.color === beyaz) {
    // geri donmemek
    if (obj.y < y || y !== obj.y - 1) {
      sonuc = false;
    }
    // ilk hamlede 2 oynamak
    if (ilkY === obj.y && y === obj.y - 2 && obj.x === x) {
      sonuc = true;
    }
  }

  if (obj.color === siyah) {
    // 
    if (obj.y > y || y !== obj.y + 1) {
      sonuc = false;
    }
    //
    if (ilkY === obj.y && y === obj.y + 2 && obj.x === x) {
      sonuc = true;
    }
  }

  if (carp_deger && carp_deger.color !== obj.color) {
    if (x === obj.x - 1 || x === obj.x + 1) {
      console.log('capture');
      sonuc = true;
    }
  }

  return sonuc;
}

// kale
function checkkaleRules (obj, x, y) {
  var hedef = { x: x, y: y };
  var carp_deger = carp_ctrl(x, y);
  var kendi_rengi = obj.color;
  
  // aynı noktada hareket etmemek
  if (x === obj.x && y === obj.y) return false;

  // capraz hareket edemez
  if (x !== obj.x && y !== obj.y) return false;
    
  // hangi yone kareket edecegini okontrol eder
  var letter = obj.x === x ? 'y' : 'x';
   
  // kalenın zıklamasını onler
  var min = Math.min(obj[letter], hedef[letter]) + 1;
  var max = Math.max(obj[letter], hedef[letter]) - 1;
  
  for (var i = min; i <= max; i++) {
    if (letter === 'y') {
      if (carp_ctrl(x, i)) return false;
    } else {
      if (carp_ctrl(i, y)) return false;
    }
  }
  
  if (carp_deger && carp_deger.color !== kendi_rengi || !carp_deger) return true;
  
  return false;
}
//at
function checkatRules(ilk, x, y) {
  var carp_deger = carp_ctrl(x, y);
  var kendi_rengi = ilk.color;
  
  if (carp_deger && carp_deger.color !== kendi_rengi || !carp_deger) {
    if ( (y === ilk.y + 2 && x === ilk.x + 1) ||
         (y === ilk.y + 2 && x === ilk.x - 1) ||
         (y === ilk.y - 2 && x === ilk.x + 1) ||
         (y === ilk.y - 2 && x === ilk.x - 1) ) return true;
    
    if ( (x === ilk.x + 2 && y === ilk.y + 1) ||
         (x === ilk.x + 2 && y === ilk.y - 1) ||
         (x === ilk.x - 2 && y === ilk.y + 1) ||
         (x === ilk.x - 2 && y === ilk.y - 1) ) return true;  
  }
  return false;
}
//fil
function checkfilRules(ilk, x, y) {
  var carp_deger = carp_ctrl(x, y);
  
  var x_fark = Math.abs(ilk.x - x);
  var y_fark = Math.abs(ilk.y - y);
  
  // capraz hareket etmek
  if ( (x_fark === y_fark) && !carp_deger ||
       (carp_deger && carp_deger.color !== ilk.color) ) {
    
    // fil atlayamaz    
    var spacesLength = x_fark - 1;
    // hareket pozitifmi negatifmi
    var xOperator = getCoordOperator(ilk.x, x);
    var yOperator = getCoordOperator(ilk.y, y);
    
    // kesisme kontrolümüz
    for (var i = 1; i <= spacesLength; i++ ) {
      var xsonuc = operation[xOperator](ilk.x, i);
      var ysonuc = operation[yOperator](ilk.y, i);
      
      if (carp_ctrl(xsonuc, ysonuc)) return false;
    }
    
    return true; 
  }
  
  return false;
}

function getCoordOperator(start, end) {
  if (start < end) return 'sum';
  return 'sub'
}

var operation = {
  sum: function(a, b) { return a + b },
  sub: function(a, b) { return a - b }
}
//vezir
function checkvezirRules(obj, x, y) {
  //kalenin ve filin ozelliklerini cektim
  if (checkkaleRules(obj, x, y) || checkfilRules(obj, x, y)) return true;
  
  return false;
}
//sah
function checksahRules(obj, x, y) {
  var x_fark = Math.abs(obj.x - x);
  var y_fark = Math.abs(obj.y - y);
  
  // aynı yere atlayamaz
  if (obj.x === x && obj.y === y) return false;
  
  // enfazla 1 kare ilerler
  if (x_fark <= 1 && y_fark <= 1) return true;
  
  return false;
}


//suruklemek...
function drag(event) {
  if (event.target.classList.contains('game-piece')) {
    var element = event.target;
    var width = element.offsetWidth / 2;
    var height = element.offsetHeight / 2;
    var player = element.dataset.player;
    
    var turn = game.turn ? siyah : beyaz;
    // oyuncunun kendi tasını surukleyip suruklemedigini kontroll eder
    if (player === turn) isMoving = true;
    
    element.addEventListener('mousemove', function(e) {
      if (isMoving) {
        var x = e.clientX - width;
        var y = e.clientY - height;
        
        var board = BOARD_DOM.getBoundingClientRect();
        var coordX = x - board.x;
        var coordY = y - board.y;
        
        // tahtamızın sınırlerı       
        if (coordX < 0 || coordX > 375 || coordY < 0 || coordY > 375 ) return
                
        var position = 'left:' + x + 'px;top:' + y + 'px; z-index: 1;';
        element.setAttribute('style', position);
        element.classList.add('active');
      }
    });
  }
}

function drop(event) {
  if (isMoving) {
    var element = event.target
    var x = event.x;
    var y = event.y;

    element.classList.remove('active');

    var coords = getCoordinates(x, y);
    guncellemeBoard(element, coords);
  }

  isMoving = false;
}

function getCoordinates(x, y) {
  var board = BOARD_DOM.getBoundingClientRect();
  
  var coordX = x - board.x - BOARD_BORDER; 
  var coordY = y - board.y - BOARD_BORDER;
  
  const boardSize = ROW * SQUARE_SIZE;
  var sonucX = Math.floor(coordX / boardSize * ROW);
  var sonucY = Math.floor(coordY / boardSize * ROW);
  
  return { x: sonucX, y: sonucY };
}

function guncellemeBoard(element, coord) {
  var x = coord.x;
  var y = coord.y;
  var id = element.dataset.piece;  
  var piece = game.pieces[id];
    
  // tasların baslangıc kordinatlarını silmeliyiz
  game.board[piece.y][piece.x].piece = null;
  // yeni kordinatlar
  piece.guncelleme(x, y);
} 

function carp_ctrl(x, y) {
  return (game.board[y][x].piece) 
}

function guncellemeTurn() {
  this.turn = !this.turn;
  
  var classValue = this.turn ? 'player-siyah' : 'player-white';
  var player = this.turn ? 'siyah' : 'beyaz';

  //sira kimde soylemek
  var feedBack = '<div class="' + classValue + '">sıradaki: ' + player + '</div>';
  
  turnDom.innerHTML = feedBack;
}

// ---------------------------------------------------
// oyun modülü
// ---------------------------------------------------

var game = {
  board: createBoard(ROW, COL),
  olusmak: olusmakBoard,
  pieces: {},
  turn: true,
  guncellemeTurn: guncellemeTurn,
  init: function() {
    BOARD_DOM.addEventListener('mousedown', drag);
    BOARD_DOM.addEventListener('mouseup', drop);

    for (var i = 0; i < 8; i++) {
      new GamePiece(i, 1, piyon, siyah, i);
    }

    for (var i = 0; i < 8; i++) {
      new GamePiece(i, 6, piyon, beyaz, i);
    }
    
    new GamePiece(0, 7, kale, beyaz, 1);
    new GamePiece(7, 7, kale, beyaz, 2);
    new GamePiece(1, 7, at, beyaz, 1);
    new GamePiece(6, 7, at, beyaz, 2);
    new GamePiece(2, 7, fil, beyaz, 1);
    new GamePiece(5, 7, fil, beyaz, 2);
    new GamePiece(3, 7, vezir, beyaz, 1);
    new GamePiece(4, 7, sah, beyaz, 1);
    
    new GamePiece(0, 0, kale, siyah, 1);
    new GamePiece(7, 0, kale, siyah, 2);
    new GamePiece(1, 0, at, siyah, 1);
    new GamePiece(6, 0, at, siyah, 2);
    new GamePiece(2, 0, fil, siyah, 1);
    new GamePiece(5, 0, fil, siyah, 2);
    new GamePiece(3, 0, vezir, siyah, 1);
    new GamePiece(4, 0, sah, siyah, 1);

    this.guncellemeTurn();
    this.olusmak();
  } 
}

game.init();