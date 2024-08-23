import { useState, useEffect, useRef } from "react"
import clients from './Data/clients.json'
import clients_alternative from './Data/selectedClients.json'
import PrintContainer from "./Components/PrintContainer"

export default function App () {
  const searchTimeoutRef = useRef(null)
  const selectedClients = clients_alternative
  const [articles, setArticles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchSecondTerm, setSearchSecondTerm] = useState('')
  const [searchSelectedClient, setSearchSelectedClient] = useState('')
  const [printMode, setPrintMode] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedArticles, setSelectedArticles] = useState([])
  const [data, setData] = useState({
    id: '',
    cliente: '',
    domicilio: '',
    ciudad: '',
    provincia: '',
    cond_fiscal: '',
    cuit: '',
    cond_venta: '',
    vendedor: '',
    fecha: new Date().toISOString().split('T')[0],
    nro_factura: '',
    punto_venta: '',
    dom_entrega: '',
    tel: '',
    valued: '',
  })
  const [articleData, setArticleData] = useState({
    sku: '',
    quantity: '',
    description: '',
  })

  useEffect(()=> {
    fetch('https://technologyline.com.ar/api/products?all=true')
    .then(res => { 
      if(!res.ok){
        throw new Error('Error al traer articulos')
      }
      return res.json()
    })
    .then(data => {
      setArticles(data)
    })
    .catch(e => console.error(e))
  },[])

  useEffect(()=> {
    console.log(data.id)
  },[data.id])

  const handleChange = (e) => {
    const { id, value } = e.target
    setData(prevData => ({
      ...prevData,
      [id]: value
    }))
  }
  
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (value) {
        const results = clients.clientes.filter(client =>
          client.documento && 
          client.razon_social &&
          (
            client.id.includes(value) ||
            client.razon_social.toLowerCase().includes(value.toLowerCase()) ||
            client.documento.includes(value)
          )
        )
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    }, 250)
  }

  const handleSelectedClient = (e) => {
    const value = e.target.value
    setSearchSecondTerm(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      const selectedClient = selectedClients.find(client => client.id === value);
    
      if (selectedClient) { handleSecondClientSelect(selectedClient) } 
      else { alert('No se encontro cliente!') }
    }, 250) 
  }
  
  const handleSecondClientSelect = (selectedClient) => {
    setData({
      ...data,
      cliente: selectedClient.razon_social,
      domicilio: selectedClient.domicilio,
      ciudad: selectedClient.ciudad,
      provincia: selectedClient.provincia,
      cond_fiscal: selectedClient.clase_fiscal,
      cuit: selectedClient.documento,
      tel: '',
    })
    setSearchSecondTerm('')
    setSearchSelectedClient([])
  }

  const handleClientSelect = (client) => {
    setData({
      id: client.id,
      cliente: client.razon_social,
      domicilio: client.domicilio,
      ciudad: client.ciudad,
      provincia: client.provincia,
      cond_fiscal: client.clase_fiscal,
      cuit: client.documento,
      cond_venta: '',
      vendedor: client.vendedor,
      fecha: new Date().toISOString().split('T')[0],
      nro_factura: '',
      punto_venta: '',
      dom_entrega: client.dom_env || '',
      tel: client.celular || '',
    })
    setSearchTerm('')
    setSearchResults([])
  }

  // const handleSecondKeyPress = (e) => {
  //   if (e.key === 'Enter') {
  //     const client = selectedClients.find(client => client.id === searchSecondTerm)
  //     if (client) {
  //       handleSecondClientSelect(client)
  //     } 
  //     else {
  //       alert('No se ha encontrado cliente')
  //     }
  //   }
  // }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const client = clients.clientes.find(client => client.id === searchTerm)
      if (client) {
        handleClientSelect(client)
      } 
      else {
        handleClientSelect({
          ciudad: "",
          clase_fiscal: "",
          documento: "",
          domicilio: "",
          fecha_alta: "",
          id: "",
          inactivo: false,
          pais: "",
          provincia: "",
          razon_social: "",
          tipo_documento: "",
          celular: '',
          dom_env: '',
          tipo_moneda: "",
          vendedor: ""
        })
        alert('No se ha encontrado cliente')
      }
    }
  }

  const handleArticleSearch = (e) => {
    const value = e.target.value
    setArticleData(prevArticleData => ({
      ...prevArticleData,
      sku: value
    }))
  
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  
    searchTimeoutRef.current = setTimeout(() => {
      if (value) {
        const results = articles.filter(article =>
          article.sku.toLowerCase().includes(value.toLowerCase()) ||
          article.name.toLowerCase().includes(value.toLowerCase())
        )
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    }, 250)
  }

  const handleArticleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const article = articles.find(article => article.sku.toLowerCase() === articleData.sku.toLowerCase())
      if (article) {
        handleArticleSelect(article)
      } else {
        alert('No se ha encontrado artículo')
      }
    }
  }

  const handleArticleSelect = (article) => {
    setSelectedArticles(prevArticles => {
      const existingArticle = prevArticles.find(a => a.sku === article.sku)
      if (existingArticle) {
        return prevArticles.map(a =>
          a.sku === article.sku ? { ...a, quantity: a.quantity + 1 } : a
        )
      } 
      
      else {
        return [...prevArticles, { ...article, quantity: 1 }]
      }
    })
    setArticleData({ sku: '', quantity: 1, description: '' })
  }

  const handleQuantityChange = (index, value) => {
    setSelectedArticles(prevArticles => {
      const newArticles = [...prevArticles]
      newArticles[index].quantity = parseInt(value)
      return newArticles
    })
  }

  const handleDeleteArticle = (index) => {
    setSelectedArticles(prevArticles => {
      const newArticles = [...prevArticles]
      newArticles.splice(index, 1)
      return newArticles
    })
  }

  const handleReset = () => {
    setPrintMode(false)
    setData({
      cliente: '',
      domicilio: '',
      ciudad: '',
      provincia: '',
      cond_fiscal: '',
      cuit: '',
      cond_venta: '',
      vendedor: '',
      fecha: new Date().toISOString().split('T')[0],
      nro_factura: '',
      punto_venta: '',
      dom_entrega: '',
      tel: '',
      valued: '',
    })
    setArticleData({
      sku: '',
      quantity: '',
      description: '',
    })
    setSelectedArticles([])
  }

  const formatDataForPrint = ()=> {
    setData(prevData => ({
      ...prevData,
      nro_factura: prevData.nro_factura.padStart(8, '0'),
      punto_venta: prevData.punto_venta.padStart(5, '0')
    }))
  }

  const handlePrint = () => {
    formatDataForPrint()
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 500);
  }

  if (printMode) {
    return (
      <PrintContainer data={data} selectedArticles={selectedArticles} />
    )
  }

  return (
    <main className="flex w-full gap-y-10 min-h-screen justify-center items-center flex-col bg-[#161f27] text-white">
      <div className="flex flex-col w-3/4 gap-5 min-h-[500px] border-4 border-white rounded-xl p-5">
        {/*Search client section*/}
        <section className="flex justify-around">
          <article className="flex gap-5 flex-col relative">
            <h1 className="w-full"><b>Buscar cliente</b> (ingresar numero o nombre o CUIL/CUIT/DNI y luego enter para traer datos)</h1>
            <div className="flex gap-x-5">
              <div className="flex h-[50px] items-center justify-center">
                <label className="w-[100px]" htmlFor="search">Buscar cliente:</label>
                <input onChange={handleSearch} className="w-[100px]" onKeyPress={handleKeyPress} value={searchTerm} id="search" type="text" />
              </div>

              <div className="flex h-[50px] items-center justify-center">
                <label className="w-[50px]" htmlFor="fecha">Fecha:</label>
                <input onChange={handleChange} value={data.fecha} id="fecha" type="date"/>
              </div>
   
              <div className="flex h-[50px] items-center justify-center">
                <label className="w-[120px]" htmlFor="search-2">Cliente alternativo:</label>
                <select onChange={handleSelectedClient} disabled={!data.id} className={`${!data.id ? 'cursor-not-allowed' : ''}`}>
                  <option value="" selected disabled>Seleccione una opcion</option>
                  {selectedClients.map(client => (
                    <option key={client.id} value={client.id}>{client.id} {client.razon_social}</option>
                  ))}
                </select>
                {/* <input onChange={handleSelectedClient} className="w-[100px]" onKeyPress={handleSecondKeyPress} value={searchSecondTerm} id="search-2" type="text" /> */}
              </div>
            </div>


            {/* {searchResults.length > 0
            ? ( 
              <div className={`${!searchTerm || !searchResults.length === 0 ? 'hidden' : 'block'} h-[300px] w-[400px] min-h-[100px] top-[88px] left-[30%] absolute py-2 bg-[#202b38] border rounded-lg overflow-y-auto`}>
                {searchResults.map((client, index) => (
                  <div key={index} onClick={() => handleClientSelect(client)} className="flex flex-col gap-y-1 min-w-[250px] py-1 border-b border-gray-200 cursor-pointer group">
                    <p className="text-sm group-hover:text-white group-hover:font-bold duration-200 px-2"><span className="font-bold text-gray-300">Numero:</span> {client.id}</p>
                    <p className="text-sm group-hover:text-white group-hover:font-bold duration-200 px-2"><span className="font-bold text-gray-300">Razon social:</span> {client.razon_social}</p>
                    <p className="text-sm group-hover:text-white group-hover:font-bold duration-200 px-2"><span className="font-bold text-gray-300">Documento:</span> {client.documento}</p>
                    <p className="text-sm group-hover:text-white group-hover:font-bold duration-200 px-2"><span className="font-bold text-gray-300">Ciudad:</span> {client.ciudad}</p>
                  </div>
                ))}
              </div>
            ) 
            : <h1 className={`${!searchTerm || !searchResults.length === 0 ? 'hidden' : 'block'} flex items-center px-4 h-[60px] w-[400px] top-[88px] left-[30%] absolute p-2 bg-[#202b38] border rounded-lg`}>No se han encontrado resultados.</h1>
            } */}
          </article>
        </section>

        {/*Client data section*/}
        <section className="flex justify-around">
          <article className="flex gap-5 flex-col">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cliente">Cliente:</label>
              <div>
                <input onChange={handleChange} className="w-[60px] text-center rounded-r-[0px]" value={data.id} id="cliente-1" type="text"></input>
                <input onChange={handleChange} className="w-[130px] rounded-l-[0px]" value={data.cliente} id="cliente-3" type="text" />
              </div>
            </div> 

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="domicilio">Domicilio:</label>
              <input onChange={handleChange} value={data.domicilio} id="domicilio" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="ciudad">Ciudad:</label>
              <input onChange={handleChange} value={data.ciudad} id="ciudad" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="provincia">Provincia:</label>
              <input onChange={handleChange} value={data.provincia} id="provincia" type="text"/>
            </div>
          </article>

          <article className="flex gap-5 flex-col">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cond_fiscal">Cond. fiscal:</label>
              <input onChange={handleChange} value={data.cond_fiscal} id="cond_fiscal" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cuit">C.U.I.T:</label>
              <input onChange={handleChange} value={data.cuit} id="cuit" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cond_venta">Cond. de venta:</label>
              <input onChange={handleChange} value={data.cond_venta} id="cond_venta" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="vendedor">Vendedor:</label>
              <input onChange={handleChange} value={data.vendedor} id="vendedor" type="text"/>
            </div>
          </article>

          <article className="flex gap-5 flex-col">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="punto_venta">Punto de venta:</label>
              <input onChange={handleChange} value={data.punto_venta} id="punto_venta" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="nro_factura">Nro de Factura:</label>
              <input onChange={handleChange} value={data.nro_factura} id="nro_factura" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="dom_entrega">Dom. entrega:</label>
              <input onChange={handleChange} value={data.dom_entrega} id="dom_entrega" type="text"/>
            </div>
            
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="tel">Tel:</label>
              <input onChange={handleChange} value={data.tel} id="tel" type="text"/>
            </div>
          </article>
        </section>
        
        {/*Article section*/}
        <section className="flex flex-col gap-5 w-full border-t-2 pt-4">
          <h1><b>Agregar artículos</b> (para ello solo ingresar SKU y enter, luego la cantidad)</h1>
          <article className="flex justify-around relative">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[130px]" htmlFor="sku">Agregar articulo:</label>
              <input onChange={handleArticleSearch} className="w-[400px]" onKeyPress={handleArticleKeyPress} value={articleData.sku} id="sku" type="text" />
            </div>
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[130px]" htmlFor="valued">Valorizado:</label>
              <input onChange={handleChange} className="w-full placeholder:text-[#555]" value={data.valued} id="valued" placeholder="Ej: 768967.35" type="number" />
            </div>
          {/* 
            {searchResults.length > 0
            ? ( 
              <div className={`${!articleData.sku || !searchResults.length === 0 ? 'hidden' : 'block'} h-[200px] w-[400px] min-h-[100px] top-[43px] left-[36.8%] absolute z-20 py-2 bg-[#202b38] border rounded-lg overflow-y-auto`}>
                {searchResults.map((article, index) => (
                  <div key={index} onClick={() => handleArticleSelect(article)} className="flex flex-col gap-y-1 min-w-[250px] py-1 border-b border-gray-200 cursor-pointer group">
                    <p className="text-sm group-hover:text-white group-hover:font-bold duration-200 px-2"><span className="font-bold text-gray-300">SKU:</span> {article.sku}</p>
                    <p className="text-sm group-hover:text-white group-hover:font-bold duration-200 px-2"><span className="font-bold text-gray-300">Descripción:</span> {article.name}</p>
                  </div>
                ))}
              </div>
            ) 
            : <h1 className={`${!articleData.sku || !searchResults.length === 0 ? 'hidden' : 'block'} flex items-center px-4 h-[60px] w-[400px] top-[43px] left-[36.8%] absolute p-2 bg-[#202b38] border rounded-lg`}>
                No se han encontrado resultados.
              </h1>
            } 
          */}
          </article>

          <article className="flex flex-col gap-2">
            {selectedArticles.map((article, index) => (
              <section key={index} className="flex flex-col justify-around gap-x-5 border-b relative">
                <article className="flex w-full gap-x-5">
                  <div className="flex h-[50px] items-center justify-center">
                    <label className="w-[50px]" htmlFor={`sku-${index}`}>SKU:</label>
                    <input className="w-[150px]" value={article.sku} id={`sku-${index}`} type="text" readOnly />
                  </div>

                  <div className="flex h-[50px] gap-x-2 items-center justify-center">
                    <label className="w-[70px]" htmlFor={`quantity-${index}`}>Cantidad:</label>
                    <input className="w-[150px]" value={article.quantity} id={`quantity-${index}`} type="number" onChange={(e) => handleQuantityChange(index, e.target.value)} />
                  </div>

                  <button className="absolute right-1 w-[25px] h-[25px] duration-300 rounded-full bg-red-500 text-white font-bold flex items-center justify-center" onClick={() => handleDeleteArticle(index)}>X</button>
                </article>

                <article className="flex w-full">
                  <div className="flex h-[50px] gap-x-2 items-center w-full justify-center">
                    <label className="w-[100px]" htmlFor={`description-${index}`}>Descripción:</label>
                    <input className='w-full' value={article.name} id={`description-${index}`} type="text" readOnly />
                  </div>
                </article>
              </section>
            ))}
          </article>
        </section>  

        <section className="flex gap-x-3">
          <button onClick={handlePrint} className="w-[100px] border rounded-xl hover:bg-[#283847] h-10 font-medium duration-300">Imprimir</button>
          <button onClick={handleReset} className="w-[100px] border rounded-xl hover:bg-[#283847] h-10 font-medium duration-300">Reset</button>
        </section>
      </div>
    </main>
  )
} 