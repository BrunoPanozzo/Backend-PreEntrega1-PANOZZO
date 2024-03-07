const { Router } = require('express')
const ProductManager = require('../ProductManager')

const router = Router()

const fileName = `${__dirname}/../../products.json`
const productManager = new ProductManager(fileName)

//middlewares

async function validarCamposNuevos(req, res, next) {
    const product = req.body

    if (productManager.validFields(product.title,
        product.description,
        product.price,
        product.thumbnail,
        product.code,
        product.stock,
        product.status,
        product.category)) {
        //debo verificar también que el campo "code" no se repita
        let products = await productManager.getProducts()
        const producto = products.find(item => item.code === product.code)
        if (producto) {
            let msjeError = `No se permite agregar el producto con código '${product.code}' porque ya existe`
            console.error(msjeError)
            // HTTP 400 =>
            res.status(400).json({ error: msjeError })
            return
        }
        return next()
    }
    // HTTP 400 => los campos de l producto que se quiere agregar no son válidos
    res.status(400).json({ error: "El producto que se quiere agregar posee algún campo inválido" })
}


async function validarCamposModificados(req, res, next) {
    const product = req.body

    if (productManager.validFields(product.title,
        product.description,
        product.price,
        product.thumbnail,
        product.code,
        product.stock,
        product.status,
        product.category)) {

        //antes de actualizar el producto, verificar que el campo "code" que puede venir modificado no sea igual a otros productos ya existentes
        let products = await productManager.getProducts()
        let prod = products.find(item => ((item.code === product.code) && (item.id != product.id)))
        if (prod) {
            let msjeError = `No se permite modificar el producto con código '${prod.code}' porque ya existe`
            console.error(msjeError)
            // HTTP 400 =>
            res.status(400).json({ error: msjeError })
            return
        }
        //debo verificar que el producto exista
        const existingProductIdx = products.findIndex(item => item.id === product.id)
        if (existingProductIdx < 0) {
            // HTTP 400 =>
            res.status(400).json({ error: `El producto con código \"${prod.code}\" no se puede modificar porque no existe` })
            return
        }
        return next()
    }
    // HTTP 400 => los campos del producto que se quiere modificar no son válidos
    res.status(400).json({ error: "El producto que se quiere modificar posee algún campo inválido" })
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
        res.status(404).json(`El producto con código '${prodId}' no existe.`)
})

router.post('/', validarCampos, async (req, res) => {
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


router.put('/:pid', validarCamposModificados, async (req, res) => {
    const prodId = +req.params.pid
    const product = req.body

    //valido el ID que hasta el momento no fue evaluado
    if (isNaN(prodId)) {
        // HTTP 400 => hay un error en el request o alguno de sus parámetros
        res.status(400).json({ error: "Formato inválido del productID" })
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
        res.status(400).json({ error: "Formato inválido del productID" })
        return
    }

    await productManager.deleteProduct(prodId)

    // HTTP 200 OK => producto eliminado exitosamente
    res.status(200).json(prodId)
})

const main = async () => {
    await productManager.inicializar()
}

main()

module.exports = router