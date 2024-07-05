import { useState, useEffect } from "react"
import clients from './Data/clients.json'

export default function App () {
  const [data, setData] = useState({
    cliente: '',
    domicilio: '',
    ciudad: '',
    provincia: '',
    cond_fiscal: '',
    cuit: '',
    cond_venta: '',
    vendedor: '',
    fecha: '',
    nro_factura: '',
    dom_entrega: '',
    tel: '',
    valorizado: '',
    articulo: '',
    cantidad: '',
    descripcion: '',
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
      console.log(data)
    })
    .catch(e => console.error(e))
  },[])

  return (
    <main className="flex w-svw min-h-screen justify-center items-center">
      <div className="flex flex-col w-3/4 gap-5 min-h-[500px] border-4 border-white rounded-xl p-5">
        <h1><b>Buscar cliente</b> (ingresar numero o nombre o CUIL/CUIT/DNI y luego enter para traer datos)</h1>
        <section className="flex justify-around">
          <article className="flex gap-5 flex-col">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cliente">Cliente:</label>
              <input onChange={''} value={data.cliente} id="cliente" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="domicilio">Domicilio:</label>
              <input onChange={''} value={data.domicilio} id="domicilio" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="ciudad">Ciudad:</label>
              <input onChange={''} value={data.ciudad} id="ciudad" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="provincia">Provincia:</label>
              <input onChange={''} value={data.provincia} id="provincia" type="text"/>
            </div>
          </article>

          <article className="flex gap-5 flex-col">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cond_fiscal">Cond. fiscal:</label>
              <input onChange={''} value={data.cond_fiscal} id="cond_fiscal" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cuit">C.U.I.T:</label>
              <input onChange={''} value={data.cuit} id="cuit" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cond_venta">Cond. de venta:</label>
              <input onChange={''} value={data.cond_venta} id="cond_venta" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="vendedor">Vendedor:</label>
              <input onChange={''} value={data.vendedor} id="vendedor" type="text"/>
            </div>
          </article>

          <article className="flex gap-5 flex-col">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="fecha">Fecha:</label>
              <input onChange={''} value={data.fecha} id="fecha" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="nro_factura">Nro de Factura:</label>
              <input onChange={''} value={data.nro_factura} id="nro_factura" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="dom_entrega">Dom. entrega:</label>
              <input onChange={''} value={data.dom_entrega} id="dom_entrega" type="text"/>
            </div>
            
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="tel">Tel:</label>
              <input onChange={''} value={data.tel} id="tel" type="text"/>
            </div>
          </article>
        </section>

        <section className="flex flex-col gap-5 w-full border-t-2 pt-4">
          <h1><b>Agregar articulos</b> (para ello solo ingresar sku y enter, luego la cantidad)</h1>
          <article className="flex justify-around">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="articulo">Articulo:</label>
              <input onChange={''} value={data.articulo} id="articulo" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="cantidad">Cantidad:</label>
              <input onChange={''} value={data.cantidad} id="cantidad" type="text"/>
            </div>

            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="descripcion">Descripcion:</label>
              <input onChange={''} value={data.descripcion} id="descripcion" type="text"/>
            </div>
          </article>

          <article className="flex justify-around">
            <div className="flex h-[50px] gap-x-2 items-center justify-center">
              <label className="w-[100px]" htmlFor="valorizado">Valorizado:</label>
              <input onChange={''} value={data.valorizado} id="valorizado" type="text"/>
            </div>
          </article>
        </section>
      </div>
    </main>
  )
} 