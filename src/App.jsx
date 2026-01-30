import { useState, useEffect, useRef } from "react"
import clients_alternative from './Data/selectedClients.json'
import PrintContainer from "./Components/PrintContainer"
import ImportarClientesExcel from "./ImportarClientesExcel"

// Nuevo: ícono SVG simple para el botón de agregar
const PlusIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
)

const API_URL = //cambia según el entorno
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL_DEV;

export default function App () {
  const searchTimeoutRef = useRef(null)
  const selectedClients = clients_alternative
  const [articles, setArticles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [printMode, setPrintMode] = useState(false)
  const [selectedArticles, setSelectedArticles] = useState([])
  const [alternativeClientSelect, setAlternativeClientSelect] = useState('')
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

  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [addClientLoading, setAddClientLoading] = useState(false)
  const [addClientError, setAddClientError] = useState('')
  const [addClientSuccess, setAddClientSuccess] = useState('')
  const [addClientForm, setAddClientForm] = useState({
    razon_social: '',
    domicilio: '',
    ciudad: '',
    provincia: '',
    clase_fiscal: '',
    documento: '',
    tel: '', 
    numero_cliente: '', // puede ser nulo
  })
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [allClients, setAllClients] = useState([])
  const [loadingAllClients, setLoadingAllClients] = useState(false)
  const [errorAllClients, setErrorAllClients] = useState('')

  // Fetch solo los activados para el select
  const [selectedClientsState, setSelectedClientsState] = useState([])
  useEffect(() => {
    fetch(`${API_URL}/api/admin/cliente-especial-activos`)
      .then(res => {
        if (!res.ok) throw new Error('Error al traer clientes especiales activos')
        return res.json()
      })
      .then(data => {
        setSelectedClientsState(Array.isArray(data) ? data : [])
      })
      .catch(e => console.error(e))
  }, [API_URL])

  // Fetch todos para el modal de administración
  const fetchAllClients = () => {
    setLoadingAllClients(true)
    setErrorAllClients('')
    fetch(`${API_URL}/api/admin/cliente-especial`)
      .then(res => {
        if (!res.ok) throw new Error('Error al traer todos los clientes especiales')
        return res.json()
      })
      .then(data => {
        setAllClients(Array.isArray(data) ? data : [])
      })
      .catch(e => setErrorAllClients(e.message))
      .finally(() => setLoadingAllClients(false))
  }

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

  const handleChange = (e) => {
    const { id, value } = e.target
    setData(prevData => ({
      ...prevData,
      [id === 'cliente-1' ? 'id' : 
       id === 'cliente-3' ? 'cliente' : 
       id]: value
    }))
  }
  
  const handleAddClientInputChange = (e) => {
    const { name, value } = e.target
    setAddClientForm(prev => ({ ...prev, [name]: value }))
  }

  // Cuando se agrega un cliente especial, refrescar ambas listas
  const handleAddClientSubmit = async (e) => {
    e.preventDefault()
    setAddClientLoading(true)
    setAddClientError('')
    setAddClientSuccess('')
    try {
      const res = await fetch(`${API_URL}/api/admin/cliente-especial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addClientForm)
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al crear cliente especial')
      }
      // Refrescar ambas listas
      fetchAllClients()
      const updated = await fetch(`${API_URL}/api/admin/cliente-especial-activos`).then(r => r.json())
      setSelectedClientsState(Array.isArray(updated) ? updated : [])
      setAddClientSuccess('Cliente especial agregado correctamente')
      setShowAddClientModal(false)
      setAddClientForm({
        razon_social: '', domicilio: '', ciudad: '', provincia: '', clase_fiscal: '', documento: '', tel: '', numero_cliente: ''
      })
    } catch (err) {
      setAddClientError(err.message || 'Error al crear cliente especial')
    } finally {
      setAddClientLoading(false)
    }
  }

  const handleSelectedClient = (e) => {
    const value = e.target.value
    setAlternativeClientSelect(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      // Buscar por numero_cliente en vez de id
      const selectedClient = selectedClientsState.find(client => String(client.numero_cliente) === String(value));
    
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
  }

  const handleKeyPress = (e) => {
    try {
      if (!searchTerm) {
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
      }

      if (e.key === 'Enter' && searchTerm) {
        fetch(`https://technologyline.com.ar/api/admin/remitos/clients?id=${parseInt(searchTerm)}`)
          .then(res => { 
            if(!res.ok){
              throw new Error('Error al traer articulos')
            }

            return res.json()
          })
          .then(data => {
            if(!data[0] || data[0] === undefined) {
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

            handleClientSelect(data[0])
          })
          .catch(e => console.error(e))
      }
    } 
    catch (e) {
      throw new Error('Error al traer cliente', e)
    }
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

  // PATCH activar/desactivar cliente especial
  const handleToggleActivado = async (cliente) => {
    try {
      await fetch(`${API_URL}/api/admin/cliente-especial/${cliente.id}/activado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activado: !cliente.activado })
      })
      fetchAllClients()
      // Refrescar lista de activados para el select
      const updated = await fetch(`${API_URL}/api/admin/cliente-especial-activos`).then(r => r.json())
      setSelectedClientsState(Array.isArray(updated) ? updated : [])
    } catch (e) {
      alert('Error al actualizar estado del cliente')
    }
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
                <input onChange={(e)=> setSearchTerm(e.target.value)} className="w-[100px]" onKeyDown={handleKeyPress} value={searchTerm || ''} id="search" type="text" />
              </div>

              <div className="flex h-[50px] items-center justify-center">
                <label className="w-[50px]" htmlFor="fecha">Fecha:</label>
                <input onChange={handleChange} value={data.fecha || ''} id="fecha" type="date"/>
              </div>
   
              <div className="flex h-[50px] items-center justify-center">
                <label className="w-[120px]" htmlFor="search-2">Cliente alternativo:</label>
                {(() => {
                  // Deduplicate clients by numero_cliente para evitar warning de React
                  const uniqueClients = Array.from(
                    new Map(selectedClientsState.map(client => [client.numero_cliente, client])).values()
                  );
                  return (
                    <select onChange={handleSelectedClient} value={alternativeClientSelect} disabled={!data.id} className={`${!data.id ? 'cursor-not-allowed' : ''}`}>
                      <option value="" disabled>Seleccione una opcion</option>
                      {uniqueClients.map(client => (
                        <option key={client.numero_cliente} value={client.numero_cliente}>{client.numero_cliente} {client.razon_social}</option>
                      ))}
                    </select>
                  );
                })()}
                {/* Botón para agregar cliente especial */}
                <button
                  type="button"
                  className="ml-2 p-1 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                  title="Agregar cliente especial"
                  onClick={() => setShowAddClientModal(true)}
                >
                  <PlusIcon />
                </button>
                {/* Botón para administrar clientes especiales */}
                <button
                  type="button"
                  className="ml-2 p-1 rounded-full bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center"
                  title="Administrar clientes especiales"
                  onClick={() => { setShowAdminModal(true); fetchAllClients(); }}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
              </div>
            </div>
          </article>
        </section>

        {/* Modal para agregar cliente especial */}
        {showAddClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white text-black rounded-lg p-8 w-[400px] relative">
              <button className="absolute top-2 right-2 text-xl" onClick={() => setShowAddClientModal(false)}>×</button>
              <h2 className="text-lg font-bold mb-4">Agregar Cliente Especial</h2>
              <form onSubmit={handleAddClientSubmit} className="flex flex-col gap-3">
                <input name="razon_social" value={addClientForm.razon_social} onChange={handleAddClientInputChange} placeholder="Razón social" required className="border p-2 rounded" />
                <input name="domicilio" value={addClientForm.domicilio} onChange={handleAddClientInputChange} placeholder="Domicilio" required className="border p-2 rounded" />
                <input name="ciudad" value={addClientForm.ciudad} onChange={handleAddClientInputChange} placeholder="Ciudad" required className="border p-2 rounded" />
                <input name="provincia" value={addClientForm.provincia} onChange={handleAddClientInputChange} placeholder="Provincia" required className="border p-2 rounded" />
                <input name="clase_fiscal" value={addClientForm.clase_fiscal} onChange={handleAddClientInputChange} placeholder="Clase fiscal" required className="border p-2 rounded" />
                <input name="documento" value={addClientForm.documento} onChange={handleAddClientInputChange} placeholder="Documento" required className="border p-2 rounded" />
                <input name="tel" value={addClientForm.tel} onChange={handleAddClientInputChange} placeholder="Teléfono" className="border p-2 rounded" />
                <input name="numero_cliente" value={addClientForm.numero_cliente} onChange={handleAddClientInputChange} placeholder="Número cliente (opcional)" className="border p-2 rounded" />
                {addClientError && <div className="text-red-600 text-sm">{addClientError}</div>}
                {addClientSuccess && <div className="text-green-600 text-sm">{addClientSuccess}</div>}
                <button type="submit" className="bg-green-600 text-white rounded p-2 mt-2" disabled={addClientLoading}>{addClientLoading ? 'Guardando...' : 'Guardar'}</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal de administración de clientes especiales */}
        {showAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white text-black rounded-lg p-8 w-[600px] max-h-[80vh] overflow-y-auto relative">
              <button className="absolute top-2 right-2 text-xl" onClick={() => setShowAdminModal(false)}>×</button>
              <h2 className="text-lg font-bold mb-4">Administrar Clientes Especiales</h2>
              {loadingAllClients ? <div>Cargando...</div> : errorAllClients ? <div className="text-red-600">{errorAllClients}</div> : (
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">N° Cliente</th>
                      <th className="text-left">Razón Social</th>
                      <th className="text-left">Estado</th>
                      <th className="text-left">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allClients.map(cliente => (
                      <tr key={cliente.id} className={cliente.activado ? '' : 'opacity-60'}>
                        <td>{cliente.numero_cliente}</td>
                        <td>{cliente.razon_social}</td>
                        <td>{cliente.activado ? 'Activo' : 'Desactivado'}</td>
                        <td>
                          <button
                            className={`rounded p-1 px-2 text-white ${cliente.activado ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            onClick={() => handleToggleActivado(cliente)}
                          >
                            {cliente.activado ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/*Client data section*/}
        <section className="flex justify-around">
          <article className="flex gap-5 flex-col">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cliente">Cliente:</label>
              <div>
                <input onChange={handleChange} className="w-[60px] text-center rounded-r-[0px]" value={data.id || ''} id="cliente-1" type="text"></input>
                <input onChange={handleChange} className="w-[130px] rounded-l-[0px]" value={data.cliente || ''} id="cliente-3" type="text" />
              </div>
            </div> 

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="domicilio">Domicilio:</label>
              <input onChange={handleChange} value={data.domicilio || ''} id="domicilio" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="ciudad">Ciudad:</label>
              <input onChange={handleChange} value={data.ciudad || ''} id="ciudad" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="provincia">Provincia:</label>
              <input onChange={handleChange} value={data.provincia || ''} id="provincia" type="text"/>
            </div>
          </article>

          <article className="flex gap-5 flex-col">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cond_fiscal">Cond. fiscal:</label>
              <input onChange={handleChange} value={data.cond_fiscal || ''} id="cond_fiscal" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cuit">C.U.I.T:</label>
              <input onChange={handleChange} value={data.cuit || ''} id="cuit" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cond_venta">Cond. de venta:</label>
              <input onChange={handleChange} value={data.cond_venta || ''} id="cond_venta" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="vendedor">Vendedor:</label>
              <input onChange={handleChange} value={data.vendedor || ''} id="vendedor" type="text"/>
            </div>
          </article>

          <article className="flex gap-5 flex-col">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="punto_venta">Punto de venta:</label>
              <input onChange={handleChange} value={data.punto_venta || ''} id="punto_venta" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="nro_factura">Nro de Factura:</label>
              <input onChange={handleChange} value={data.nro_factura || ''} id="nro_factura" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="dom_entrega">Dom. entrega:</label>
              <input onChange={handleChange} value={data.dom_entrega || ''} id="dom_entrega" type="text"/>
            </div>
            
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="tel">Tel:</label>
              <input onChange={handleChange} value={data.tel || ''} id="tel" type="text"/>
            </div>
          </article>
        </section>
        
        {/*Article section*/}
        <section className="flex flex-col gap-5 w-full border-t-2 pt-4">
          <h1><b>Agregar artículos</b> (para ello solo ingresar SKU y enter, luego la cantidad)</h1>
          <article className="flex justify-around relative">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[130px]" htmlFor="sku">Agregar articulo:</label>
              <input onChange={(e)=> setArticleData(prevArticleData => ({ ...prevArticleData, sku: e.target.value }))} className="w-[400px]" onKeyDown={handleArticleKeyPress} value={articleData.sku || ''} id="sku" type="text" />
            </div>
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[130px]" htmlFor="valued">Valorizado:</label>
              <input onChange={handleChange} className="w-full placeholder:text-[#555]" value={data.valued || ''} id="valued" placeholder="Ej: 768967.35" type="number" />
            </div>
          </article>

          <article className="flex flex-col gap-2">
            {selectedArticles.map((article, index) => (
              <section key={index} className="flex flex-col justify-around gap-x-5 border-b relative">
                <article className="flex w-full gap-x-5">
                  <div className="flex h-[50px] items-center justify-center">
                    <label className="w-[50px]" htmlFor={`sku-${index}`}>SKU:</label>
                    <input className="w-[150px]" value={article.sku || ''} id={`sku-${index}`} type="text" readOnly />
                  </div>

                  <div className="flex h-[50px] gap-x-2 items-center justify-center">
                    <label className="w-[70px]" htmlFor={`quantity-${index}`}>Cantidad:</label>
                    <input className="w-[150px]" value={article.quantity || ''} id={`quantity-${index}`} type="number" onChange={(e) => handleQuantityChange(index, e.target.value)} />
                  </div>

                  <button className="absolute right-1 w-[25px] h-[25px] duration-300 rounded-full bg-red-500 text-white font-bold flex items-center justify-center" onClick={() => handleDeleteArticle(index)}>X</button>
                </article>

                <article className="flex w-full">
                  <div className="flex h-[50px] gap-x-2 items-center w-full justify-center">
                    <label className="w-[100px]" htmlFor={`description-${index}`}>Descripción:</label>
                    <input className='w-full' value={article.name || ''} id={`description-${index}`} type="text" readOnly />
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

        <ImportarClientesExcel />
      </div>
    </main>
  )
}