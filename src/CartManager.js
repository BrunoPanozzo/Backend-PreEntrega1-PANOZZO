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

    // //validar un string permitiendo solo números y letras
    // #soloLetrasYNumeros = (cadena) => {
    //     return (/^[a-zA-Z0-9]+$/.test(cadena))
    // }

    // //validar permitiendo solo números
    // #soloNumeros = (cadena) => {
    //     return (/^[0-9]+$/.test(cadena))
    // }

    // //validar permitiendo solo números positivos
    // #soloNumerosPositivos = (cadena) => {
    //     return (this.#soloNumeros(cadena) && (+cadena > 0))
    // }

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

    // //validar los campos de un "objeto" carrito
    // validFields = (title, description, price, thumbnail, code, stock, status, category) => {
    //     //validar que el campo "title" no esté vacío        
    //     if (title.trim().length <= 0) {
    //         console.error("El campo \"title\" es inválido")
    //         return false
    //     }
    //     //validar que el campo "description" no esté vacío
    //     if (description.trim().length <= 0) {
    //         console.error("El campo \"description\" es inválido")
    //         return false
    //     }
    //     //validar que el campo "price" contenga sólo números
    //     if ((!this.#soloNumerosPositivos(price)) || (typeof price != "number")) {
    //         console.error("El campo \"price\" no es un número positivo")
    //         return false
    //     }
    //     //el campo "thumbnail" puede estar vacío, por eso queda comentado la validacion anterior, solo
    //     //verificar que es un arreglo de strings
    //     // if (thumbnail.trim().length <= 0) {
    //     //     console.error("El campo \"thumbnail\" es inválido")
    //     //     return false
    //     // 
    //     if (!Array.isArray(thumbnail)) {
    //         return false
    //     }
    //     else {
    //         let pos = -1
    //         do {
    //             pos++
    //         } while ((pos < thumbnail.length) && (typeof thumbnail[pos] == "string"));
    //         if (pos != thumbnail.length)
    //             return false
    //     }
    //     //validar que el campo "status" sea booleano
    //     if (typeof status != "boolean") {
    //         console.error("El campo \"status\" no es booleano")
    //         return false
    //     }
    //     //validar que el campo "category"  no esté vacío
    //     if (category.trim().length <= 0) {
    //         console.error("El campo \"category\" es inválido")
    //         return false
    //     }
    //     //validar que el campo "code" contenga sólo números y letras
    //     const codeAValidar = code.trim()
    //     if ((codeAValidar.length <= 0) || (!this.#soloLetrasYNumeros(codeAValidar))) {
    //         console.error("El campo \"code\" es inválido")
    //         return false
    //     }
    //     //validar que el campo "stock" contenga sólo números
    //     if ((!this.#soloNumeros(stock)) || (typeof stock != "number")) {
    //         console.error("El campo \"stock\" no es un número")
    //         return false
    //     }
    //     return true
    // }


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
