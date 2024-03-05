const { Router } = require('express')
const ProductManager = require('../ProductManager')

const router = Router()

const fileName = `${__dirname}/../../products.json`
const productManager = new ProductManager(fileName)

//middlewares

function validarCampos(req, res, next) {
    console.log('entre al middleware')

    const product = req.body

    if (productManager.validFields(product.title,
                                   product.description,
                                   product.price,                                  
                                   product.thumbnail,
                                   product.code,
                                   product.stock,
                                   product.status,
                                   product.category)) {
        console.log(product)

        return next()
    }
    // HTTP 400 => los campos de l producto que se quiere agregar no son válidos
    res.status(400).json({ error: "El producto posee algún campo inválido" })
}

//endpoints

router.get('/', async (req, res) => {
    const { limit } = req.query

    let products = await productManager.getProducts()

    let filteredProducts = []

    if (limit) {
        if (isNaN(limit) || (limit < 0)) {
            // HTTP 400 => hay un error en el request o alguno de sus parámetros
            res.status(400).json({ error: "Formato inválido del límite" })
            return
        }

        filteredProducts = products.splice(0, limit)
    }
    else {
        filteredProducts = products
    }

    // HTTP 200 OK
    res.status(200).json(filteredProducts)
})

router.get('/:pid', (req, res) => {
    const prodId = +req.params.pid

    if (isNaN(prodId)) {
        // HTTP 400 => hay un error en el request o alguno de sus parámetros
        res.status(400).json({ error: "Formato inválido del productID" })
        return
    }

    const product = productManager.getProductById(prodId)

    if (product)
        // HTTP 200 OK => se encontró el producto
        res.status(200).json(product)
    else
        // HTTP 404 => el ID es válido, pero no se encontró ese producto
        res.status(404).json(`El producto con código '${prodId}' no existe`)
})

router.post('/', validarCampos, (req, res) => {
    console.log('pase por el post')
    res.status(200).json()
})

const main = async () => {
    await productManager.inicializar()
}

main()

module.exports = router