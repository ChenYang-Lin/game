export default class HUD {
    
    constructor(scene) {
        this.scene = scene;


        this.inventoryButton = document.getElementById("inventory-button-icon");
        console.log(this.inventoryButton)
        this.shopButton = document.getElementById("shop-button-icon")

        this.inventoryButton.addEventListener('click', () => {
            console.log("clicked")
            console.log(this.scene.inventory.inventoryScreen.inventoryContainer.style.display)
            this.scene.inventory.inventoryScreen.inventoryContainer.style.display = "grid";

        })


    }
}