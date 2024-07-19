export default function PrintContainer ({ data, selectedArticles }) {

  const parseCityAndPostalCode = (cityString) => {
    const [postalCode, ...cityParts] = cityString.split(' ')
    const city = cityParts.join(' ')
    return { postalCode, city }
  }
  const { postalCode, city } = parseCityAndPostalCode(data.ciudad)
  const valued = parseFloat(data.valued);
  const formattedValued = isNaN(valued) ? '0.00' : valued.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col gap-5 pt-[155px] text-xs bg-white min-h-screen h-full w-screen text-black">
      <section className="flex flex-col">
        <article className="flex gap-x-2 justify-end">
          <span className="font-bold">Fecha</span>
          <span className="min-w-[100px] text-end">{data.fecha}</span>
        </article>
        
        <article className="flex justify-end border-[#111] pb-1">
          <span className="font-bold min-w-[40.5px]">Fc A </span>
          <span className="min-w-[100px] text-end">{data.punto_venta + '-' + data.nro_factura}</span>
        </article>

        <article className="flex gap-y-1 border-b-2 border-[#111]">
          <ul className="flex flex-col w-full">
            <li className="flex gap-x-4">
              <span className="font-bold">Cliente</span>
              <p className="flex gap-x-10"><span>{data.id}</span>{data.cliente}</p>
            </li>

            <li className="flex gap-x-4">
              <span className="font-bold">Domicilio</span>
              <span>{data.domicilio}</span>
            </li>

            <li className="flex gap-x-[200px]">
              <div className="flex gap-x-4">
                <span className="font-bold">Ciudad</span>
                <span>{city}</span>
              </div>

              <div className="flex gap-x-3">
                <span className="font-bold">CP</span>
                <span>{postalCode}</span>
              </div>
            </li>

            <li className="flex gap-x-4">
              <span className="font-bold">Provincia</span>
              <span>{data.provincia}</span>
            </li>

            <li className="flex gap-x-4">
              <span className="font-bold">Tel</span>
              <span>{data.tel}</span>
            </li>
          </ul>

          <ul className="flex flex-col justify-end w-[450px]">  
            <li className="flex">
              <span className="font-bold w-[160px]">Condicion Fiscal</span>
              <span className="flex w-full justify-end">{'Arg. I.V.A Responsable Inscripto'}</span>
            </li>
            <li className="flex">
              <span className="font-bold w-[160px] pl-6">CUIT</span>
              <span className="flex w-full justify-end">{data.cuit}</span>
            </li>

            <li className="flex">
              <span className="font-bold w-[160px] pl-6">Cond. Venta</span>
              <span className="flex w-full justify-end">{data.cond_venta}</span>
            </li>
            
            <li className="flex">
              <span className="font-bold w-[160px] pl-6">Vendedor</span>
              <span className="flex w-full justify-end">{data.vendedor}</span>
            </li>
          </ul>
        </article>
        
        <article className="flex flex-col">
          <ul className="flex gap-x-5">
            <span className="font-bold">DOM. ENTREGA</span>
            <span>{data.dom_entrega}</span>
          </ul>

          <ul className="flex gap-x-9">
            <span className="font-bold">TRANSPORTE</span>
            <span>00-Retira en Empresa </span>
          </ul>

          <ul className="flex gap-x-5">
            <span className="font-bold">DOM. TRANSP.</span>
          </ul>
        </article>
      </section>

      <section className="flex flex-col min-h-[330px]">
        <article className="flex flex-col">
          <div className="flex font-bold border-2 px-5 border-[#111]">
            <div className="w-[75px] p-[0.3px]">COD.</div>
            <div className="w-[100px] p-[0.3px]">CANTIDAD</div>
            <div className="p-[0.3px] pl-[100px] w-fit">DESCRIPCION</div>
          </div>

          {selectedArticles.map((article, index) => (
            <div key={index} className="flex pt-1 pl-1">
              <div className="w-[100px]">{article.sku}</div>
              <div className="w-[130px] text-center">{article.quantity}</div>
              <div className="w-full">{article.name}</div>
            </div>
          ))}
        </article>
      </section>

      <section className="flex flex-col w-full items-end gap-y-10">
        <article className="w-[400px] border-b border-black border-dotted">
          Recibido por:           
        </article>

        <article className="flex flex-col w-full font-bold">
          <h3 className="w-full border-b-2 border-black pb-1"># Despachos</h3>
          <div className="flex gap-x-[190px] pt-1">
            <h3>VALORIZADO:</h3>
            <span>{formattedValued}</span>
          </div>
        </article>
      </section>
    </div>
  )
}

