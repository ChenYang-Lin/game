import MainScene from "./MainScene.js";


const config = {
    // width: 1920,
    // height: 1080,
    width: 512,
    height: 512,
    backgroundColor: "#999999",
    type: Phaser.AUTO,
    parent: "survival-game",
    scene: [MainScene],
    // scale: {
    //     zoom: 2,
    // },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,

    },
    pixelArt: true,
    physics: {
        default: "matter",
        matter: {
            debug: true,
            gravity: {y: 0},
        }
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin.default,
                key: "matterCollision",
                mapping: "matterCollision",
            }
        ]
    },
    disableContextMenu: true,
}

new Phaser.Game(config);

