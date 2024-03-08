const fs = require('fs')

class CartManager {
    //variables internas
    #carts
    static #lastID_Cart = 0

    //constructor
    constructor(pathname) {
        this.#carts = []
        this.path = pathname
    }

    inicializar = async () => {
        this.#carts = await this.getCarts()
        CartManager.#lastID_Cart = this.#getHigherID()
    }

    //métodos internos

    #getHigherID = () => {
        let higherID = 0
        this.#carts.forEach(item => {
            if (item.id > higherID)
                higherID = item.id
        });
        return higherID
    }

    //retornar un ID único para cada carrito nuevo
    #getNuevoID = () => {
        CartManager.#lastID_Cart += 1
        return CartManager.#lastID_Cart;
    }

    //leer el archivo de carritos e inicializar el array de objetos
    async #readCartsFromFile() {
        try {
            const fileCartsContent = await fs.promises.readFile(this.path)
            this.#carts = JSON.parse(fileCartsContent)
        }
        catch (err) {
            return []
        }
    }

    //guardar el array de carritos en un archivo
    async #updateCartsFile() {
        const fileCartsContent = JSON.stringify(this.#carts, null, '\t')
        await fs.promises.writeFile(this.path, fileCartsContent)
    }

    //métodos públicos
  
    //devolver todo el arreglo de carritos leidos a partir de un archivo de carritos
    getCarts = async () => {
        try {
            await this.#readCartsFromFile()
            return this.#carts
        }
        catch (err) {
            console.log('El archivo no existe.')
            return []
        }
    }

    //buscar en el arreglo de carritos un carrito con un ID determinado. Caso contrario devolver msje de error
    getCartById = (cartId) => {
        const cart = this.#carts.find(item => item.id === cartId)
        if (cart)
            return cart
        else {
            console.error(`El producto con código "${cartId}" no existe.`)
            return
        }
    } 

    //agregar un carrito al arreglo de carritos inicial y al archivo correspondiente
    addCart = async (products) => {
        const cart = {
            id: this.#getNuevoID(),
            products
        }
        
        this.#carts.push(cart)

        await this.#updateCartsFile()
    }

    //agregar un producto al array de productos de un carrito determinado
    addProductToCart = async (cartId, prodId, quantity) => {
        const cartIndex = this.#carts.findIndex(item => item.id === cartId)
        const productsFromCart = this.#carts[cartIndex].products
        const productIndex = productsFromCart.findIndex(item => item.id === prodId)
        if (productIndex != -1) {
            //existe el producto en el carrito, actualizo sólo su cantidad
            productsFromCart[productIndex].quantity += quantity
        }
        else {
            //nop existe el producto en el carito, debo crear la entrada completa
            const newProduct = {
                id: prodId,
                quantity: quantity
            }
            productsFromCart.push(newProduct)
        }
        await this.#updateCartsFile()
    }
}

module.exports = CartManager
