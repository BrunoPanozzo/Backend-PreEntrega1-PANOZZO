const { Router } = require('express')
const ProductManager = require('../ProductManager')

const router = Router()

const fileName = `${__dirname}/../../products.json`
const productManager = new ProductManager(fileName)

//middlewares

async function validateNewProduct(req, res, next) {
    const product = req.body

    if (productManager.validateProduct(product.title,
                                       product.description,
                                       product.price,
                                       product.thumbnail,
                                       product.code,
                                       product.stock,
                                       product.status,
                                       product.category)) {
        //debo verificar también que el campo "code" no se repita
        const prod = productManager.getProductByCode(product.code)    
        if (prod) {
            let msjeError = `No se permite agregar el producto con código '${product.code}' porque ya existe.`
            console.error(msjeError)
            // HTTP 400 => code repetido
            res.status(400).json({ error: msjeError })
            return
        }
        //exito, continuo al endpoint
        return next()
    }
    // HTTP 400 => producto con valores inválidos
    res.status(400).json({ error: "El producto que se quiere agregar posee algún campo inválido." })
}

async function validateUpdateProduct(req, res, next) {
    const prodId = +req.params.pid
    const product = req.body

    //primero debo verificar que el producto exista en mi array de todos los productos
    const prod = productManager.getProductById(prodId)    
    if (!prod) {
        // HTTP 404 => no existe el producto
        res.status(404).json({ error: `El producto con ID '${prodId}' no se puede modificar porque no existe.`})
        return
    }

    if (productManager.validateProduct(product.title,
                                       product.description,
                                       product.price,
                                       product.thumbnail,
                                       product.code,
                                       product.stock,
                                       product.status,
                                       product.category)) {
        //verifico que el campo "code", que puede venir modificado, no sea igual al campo code de otros productos ya existentes
        let producto = allProducts.find(element => ((element.code === product.code) && (element.id != prodId)))
        if (producto) {
            let msjeError = `No se permite modificar el producto con código '${product.code}' porque ya existe.`
            console.error(msjeError)
            // HTTP 400 => code repetido
            res.status(400).json({ error: msjeError })
            return
        }
        
        //exito, continuo al endpoint
        return next()
    }
    // HTTP 400 => producto con valores inválidos
    res.status(400).json({ error: "El producto que se quiere modificar posee algún campo inválido." })
}

//endpoints

router.get('/', async (req, res) => {
    const { limit } = req.query

    let allProducts = await productManager.getProducts()

    let filteredProducts = []

    if (limit) {
        if (isNaN(limit) || (limit < 0)) {
            // HTTP 400 => hay un error en el request o alguno de sus parámetros
            res.status(400).json({ error: "Formato inválido del límite." })
            return
        }

        filteredProducts = allProducts.splice(0, limit)
    }
    else {
        filteredProducts = allProducts
    }

    // HTTP 200 OK
    res.status(200).json(filteredProducts)
})

router.get('/:pid', (req, res) => {
    const prodId = +req.params.pid

    if (isNaN(prodId)) {
        // HTTP 400 => hay un error en el request o alguno de sus parámetros
        res.status(400).json({ error: "Formato inválido del productID." })
        return
    }

    const product = productManager.getProductById(prodId)

    if (product)
        // HTTP 200 OK => se encontró el producto
        res.status(200).json(product)
    else
        // HTTP 404 => el ID es válido, pero no se encontró ese producto
        res.status(404).json(`El producto con código '${prodId}' no existe.`)
})

router.post('/', validateNewProduct, async (req, res) => {
    const product = req.body

    await productManager.addProduct(product.title,
                                    product.description,
                                    product.price,
                                    product.thumbnail,
                                    product.code,
                                    product.stock,
                                    product.status,
                                    product.category)

    // HTTP 201 OK => producto creado exitosamente
    res.status(201).json(`El producto con código '${product.code}' se agregó exitosamente.`)
})

router.put('/:pid', validateUpdateProduct, async (req, res) => {
    const prodId = +req.params.pid
    const product = req.body

    //valido el ID que hasta el momento no fue evaluado
    if (isNaN(prodId)) {
        // HTTP 400 => hay un error en el request o alguno de sus parámetros
        res.status(400).json({ error: "Formato inválido del productID." })
        return
    }

    await productManager.updateProduct(product, prodId)

    // HTTP 200 OK => producto modificado exitosamente
    res.status(200).json(product)
})

router.delete('/:pid', async (req, res) => {
    const prodId = +req.params.pid

    if (isNaN(prodId)) {
        // HTTP 400 => hay un error en el request o alguno de sus parámetros
        res.status(400).json({ error: "Formato inválido del productID." })
        return
    }

    await productManager.deleteProduct(prodId)

    // HTTP 200 OK => producto eliminado exitosamente
    res.status(200).json(`El producto con código '${prodId}' se eliminó exitosamente.`)
})

//init methods

const main = async () => {
    await productManager.inicializar()
}

main()

module.exports = router