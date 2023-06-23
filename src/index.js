import Phaser, { Physics } from "phaser";
import platform from "./assets/stack_penguin.png";
import stack_penguin from "./assets/stack_penguin.png";
import buble_penguin from "./assets/buble_penguin.png";
import fly_penguin from "./assets/fly_penguin.png";
import background from "./assets/background.png";


// 전역 변수 선언
var currentObject; // 현재 떨어지고 있는 객체
var groundPlatform; // 바닥 플랫폼
var score = 0; // 점수
var amount = 0; // 디버그용
var scoreText; // 점수 텍스트

var totalTime = 60000; // 게임 시간 (밀리초)
var timerText; // 타이머 텍스트
var timer; // 게임 타이머
var isGameover = false; // 게임 종료 여부

var tweenX = 700; // 현재 객체의 목표 x 좌표
var tweenY = 100; // 현재 객체의 목표 y 좌표

var offset = 0; // 카메라 위치 보정 값

var gameoverText;



class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    // 이미지 리소스 로드
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.load.image("stack_penguin", stack_penguin);
    this.load.image("buble_penguin", buble_penguin);
    this.load.image("fly_penguin", fly_penguin);
    this.load.image("platform", platform);
    this.load.image("background", background);
  }

  create() {
    // 필요한 요소들 생성
    var background = this.add.image(0, 0, "background");
    background.width = this.width;
    // background.height= this.height;
    
    
    this.canDrop = true;
    

    // 랜덤 객체 생성
    var textureNames = ["stack_penguin", "fly_penguin"];
    

    textureNames.forEach((name) => {
      this.load.image(name, require(`./assets/${name}.png`));
    });
    
    var index = Math.floor(Math.random() * textureNames.length);
    currentObject = this.add.image(100, 100, textureNames[index]);
    // currentObject.setScale();

    // 객체 이동 애니메이션 설정
    var tween = this.tweens.add({
      targets: currentObject,
      x: tweenX,
      y: tweenY,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    // 바닥 플랫폼 설정
    groundPlatform = this.physics.add.staticGroup();
    groundPlatform.create(400, 550, "platform").setName("GroundPlatform");

    // 텍스트 UI
    scoreText = this.add.text(16 + this.cameras.main.x, 16 + this.cameras.main.y, "점수: 0", {
      fontSize: "32px",
      fill: "#FF8C00",
    });

    timerText = this.add.text(400, 50, totalTime.toString(), {
      fontSize: "32px",
      fill: "#FF8C00",
    });

    var gameoverText = this.add.text(320, 150, "", {
      fontSize: "32px",
      fill: "orangered",
    });

    scoreText.setScrollFactor(0, 0);
    timerText.setScrollFactor(0, 0);
    gameoverText.setScrollFactor(0, 0);
    currentObject.setScrollFactor(0, 0);

    var stackBlock = this.physics.add.group();
    var phy = this.physics;
    var cam = this.cameras.main;

    // 입력 처리
    this.input.on("pointerdown", function () {
      if (isGameover) return;
      var newObject = stackBlock.create(
        currentObject.x,
        currentObject.y - offset,
        currentObject.texture
      );
    
      newObject.setName(amount);
      amount++;
      console.log("cam y: " + cam.y);
    
      // currentObject.destroy();
      // currentObject = null;
    
      // currentObject = scene.add.image(100, 100, textureNames[Math.floor(Math.random() * textureNames.length)]);
      // tween.targets[0] = currentObject;

      currentObject.setTexture(
        textureNames[Math.floor(Math.random() * textureNames.length)]
      );
    
      if (timer.paused) {
        timer.paused = false;
      }
    });
    

    // 충돌 처리
    this.physics.add.collider(stackBlock, groundPlatform, function (first, second) {
      // first는 동적 객체, second는 정적 객체
      // 새로운 정적 객체 생성
      var placedObject = groundPlatform.create(first.x, first.y, first.texture);
      console.log("떨어진 y 좌표: " + placedObject.y);
      if (550 - first.y > score) {
        score = 550 - placedObject.y;

        scoreText.setText("점수: " + Math.floor(score));

        if (score > 250) {
          cam.centerOnY(first.y);
          offset = 250 - first.y;
        }
      }

      first.destroy();
      console.log("점수: " + score);
    });

    // 타이머 설정
    timer = this.time.addEvent({
      delay: totalTime,
      loop: false,
      paused: true,
      callback: function () {
        // 점수와 최고 점수 표시
        var localScore = localStorage.getItem("Highscore");
        var highscoreText = "";

        console.log("로컬 스토리지: " + localScore);
        if (localScore == null || parseInt(localScore) < score) {
          console.log("새로운 최고 점수!");
          localStorage.setItem("Highscore", score.toString());
          highscoreText = "새로운 최고 점수!";
        }
        gameoverText.setText("게임 종료\n" + highscoreText);

        tween.stop();
        isGameover = true;
      },
    });
  }

  update() {
    if (timer.getRemaining() > 0) timerText.setText(Math.floor((timer.getRemaining() / 1000).toString()));
  }
}

// 게임 설정
const config = {
  type: Phaser.AUTO,
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  width: 800,
  height: 600,
  scene: MyGame,
};

const game = new Phaser.Game(config);
console.log(game);
