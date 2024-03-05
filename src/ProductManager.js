const fs = require('fs')

class ProductManager {
    //variables internas
    #products
    static #lastID_Product = 0

    //constructor
    constructor(pathname) {
        this.#products = []
        this.path = pathname
    }

    inicializar = async () => {
        this.#products = await this.getProducts()
        ProductManager.#lastID_Product = this.#getHigherID()
        // console.log('Inicio ID de productos en ' + ProductManager.#lastID_Product)
    }

    //métodos internos
    #getHigherID = () => {
        let higherID = 0
        this.#products.forEach(item => {
            if (item.id > higherID)
                higherID = item.id
        });
        return higherID
    }

    //retornar un ID único para cada producto nuevo
    #getNuevoID = () => {
        ProductManager.#lastID_Product += 1
        return ProductManager.#lastID_Product;
    }

    //validar un string permitiendo solo números y letras
    #soloLetrasYNumeros = (cadena) => {
        return (/^[a-zA-Z0-9]+$/.test(cadena))
    }

    //validar permitiendo solo números
    #soloNumeros = (cadena) => {
        return (/^[0-9]+$/.test(cadena))
    }

    //leer el archivo de productos e inicializar el array de objetos
    async #readProductsFromFile() {
        try {
            const fileProductsContent = await fs.promises.readFile(this.path)
            this.#products = JSON.parse(fileProductsContent)
        }
        catch (err) {
            return []
        }
    }

    //guardar el array de productos en un archivo
    async #updateProductsFile() {
        const fileProductsContent = JSON.stringify(this.#products, null, '\t')
        await fs.promises.writeFile(this.path, fileProductsContent)
    }

    //métodos públicos

    //validar los campos de un "objeto" producto
    validFields = (title, description, price, thumbnail, code, stock, status, category) => {
        //validar que el campo "title" no esté vacío        
        if (title.trim().length <= 0) {
            console.error("El campo \"title\" es inválido")
            return false
        }
        //validar que el campo "description" no esté vacío
        if (description.trim().length <= 0) {
            console.error("El campo \"description\" es inválido")
            return false
        }
        //validar que el campo "price" contenga sólo números
        if ((!this.#soloNumeros(price)) || (typeof price != "number")) {
            console.error("El campo \"price\" no es un número")
            return false
        }
        //el campo "thumbnail" puede estar vacío, por eso queda comentado la validacion anterior, solo
        //verificar que es un arreglo de strings
        // if (thumbnail.trim().length <= 0) {
        //     console.error("El campo \"thumbnail\" es inválido")
        //     return false
        // 
        if (!Array.isArray(thumbnail)) {
            return false
        }
        else {
            thumbnail.every(rutaImg => {
                if (typeof rutaImg != "string")
                    return false;
                return true
            })
        }
        //validar que el campo "status" sea booleano
        if (typeof status != "boolean") {
            console.error("El campo \"status\" no es booleano")
            return false
        }
        //validar que el campo "category"  no esté vacío
        if (category.trim().length <= 0) {
            console.error("El campo \"category\" es inválido")
            return false
        }
        //validar que el campo "code" contenga sólo números y letras
        const codeAValidar = code.trim()
        if ((codeAValidar.length <= 0) || (!this.#soloLetrasYNumeros(codeAValidar))) {
            console.error("El campo \"code\" es inválido")
            return false
        }
        //validar que el campo "stock" contenga sólo números
        if ((!this.#soloNumeros(stock)) || (typeof stock != "number")) {
            console.error("El campo \"stock\" no es un número")
            return false
        }
        return true
    }


    //devolver todo el arreglo de productos leidos a partir de un archivo de productos
    getProducts = async () => {
        try {
            await this.#readProductsFromFile()
            return this.#products
        }
        catch (err) {
            console.log('El archivo no existe')
            return []
        }
    }

    //buscar en el arreglo de productos un producto con un ID determinado. Caso contrario devolver msje de error
    getProductById = (prodId) => {
        const producto = this.#products.find(item => item.id === prodId)
        if (producto)
            return producto
        else {
            console.error(`El producto con código "${prodId}" no existe`)
            return
        }
    }

    //agregar, si sus campos de datos son válidos, un producto al arreglo de productos inicial y al archivo correspondiente
    addProduct = async (title, description, price, thumbnail, code, stock) => {
        if (this.validFields(title, description, price, thumbnail, code, stock)) {
            //antes de agregar el producto, verificar que el campo "code" no se repita
            const producto = this.#products.find(item => item.code === code)
            if (producto) {
                console.error(`No se permite agregar el producto con código \"${code}\" porque ya existe`)
                return
            }

            //si llego a este punto, ya están validados los datos, puedo construir el objeto "producto"
            const product = {
                id: this.#getNuevoID(),
                title,
                description,
                price: Number(price),
                thumbnail,
                code,
                stock: Number(stock)
            }

            this.#products.push(product)

            await this.#updateProductsFile()
        }
    }

    //actualizar, si sus campos modificados son válidos, un producto en el arreglo de productos inicial y en el archivo correspondiente
    updateProduct = async (product) => {
        if (this.validFields(product.title, product.description, product.price, product.thumbnail, product.code, product.stock)) {
            //antes de actualizar el producto, verificar que el campo "code" que puede venir modificado no sea igual a otros productos ya existentes
            const producto = this.#products.find(item => ((item.code === product.code) && (item.id != product.id)))
            if (producto) {
                console.error(`No se permite modificar el producto con código \"${product.code}\" porque ya existe`)
                return
            }

            const existingProductIdx = this.#products.findIndex(item => item.id === product.id)

            if (existingProductIdx < 0) {
                throw 'Producto Inválido!'
            }

            // actualizar los datos de ese producto en el array
            const productData = { ...this.#products[existingProductIdx], ...product }
            this.#products[existingProductIdx] = productData

            await this.#updateProductsFile()
        }
    }

    //dado un ID de producto, eliminar el mismo del arreglo de productos y del archivo correspondiente. Caso contrario devolver msje de error
    deleteProduct = async (idProd) => {
        const producto = this.#products.find(item => item.id === idProd)
        if (producto) {
            this.#products = this.#products.filter(item => item.id !== idProd)
            await this.#updateProductsFile()
        }
        else {
            console.error(`El producto con código \"${idProd}\" no existe`)
            return
        }
    }
}

module.exports = ProductManager

// //testing de la clase "ProductManager"
// testing = async () => {
//     const productManager = new ProductManager('./products.json')

//     await productManager.inicializar()
//     let products = await productManager.getProducts()
//     console.log(products)

//     await productManager.addProduct("producto prueba A",
//         "Este es un producto prueba",
//         200,
//         "sin imagen",
//         "abc123",
//         25)

//     let products2 = await productManager.getProducts()
//     console.log(products2)

//     await productManager.addProduct("producto prueba B",
//         "Este es un producto prueba",
//         200,
//         "sin imagen",
//         "abc1234",
//         25)

//     let products3 = await productManager.getProducts()
//     console.log(products3)

//     await productManager.addProduct("producto prueba C",
//         "Este es un producto prueba",
//         200,
//         "sin imagen",
//         "abc1234",
//         25)

//     let products4 = await productManager.getProducts()
//     console.log(products4)

//     let productA = productManager.getProductById(1)
//     if (productA)
//         console.log(productA)

//     let productB = productManager.getProductById(1)
//     if (productB) {
//         console.log(productB)

//         await productManager.updateProduct({ ...productB, stock: 50, price: 300 })
//         let products4 = await productManager.getProducts()
//         console.log(products4)
//     }

//     await productManager.deleteProduct(2)
//     let products5 = await productManager.getProducts()
//     console.log(products5)

//     await productManager.deleteProduct(3)
//     let products6 = await productManager.getProducts()
//     console.log(products6)
// }

// testing()
