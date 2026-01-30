import React, { useState, useRef, useEffect } from "react";

function ImportarClientesExcel() {
  const [mensaje, setMensaje] = useState("");
  const [progreso, setProgreso] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const pollingRef = useRef(null);

  const handleFileChange = async (e) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setMensaje("Subiendo archivo de clientes. Por favor aguarde...");
    setResultado(null);
    setProgreso(null);
    setSubiendo(true);

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch(
        "https://technologyline.com.ar/api/admin/importar-clientes-excel",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (!data.ok || !data.importId) {
        setMensaje("");
        setResultado(data.message || "Error al iniciar la importación.");
        setSubiendo(false);
        return;
      }

      setMensaje("");
      setProgreso({ analizados: 0 });

      pollingRef.current = setInterval(async () => {
        try {
          const resp = await fetch(
            `https://technologyline.com.ar/api/admin/import-progress/${data.importId}`
          );
          const prog = await resp.json();
          if (prog.ok) {
            setProgreso(prog);
            if (prog.estado === "finalizado" || prog.estado === "error") {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
              setSubiendo(false);
              setResultado(
                prog.estado === "finalizado"
                  ? `Importación finalizada. Analizados: ${prog.analizados}, Importados: ${prog.importados}, Saltados: ${prog.saltados}`
                  : `Error: ${prog.mensaje || "Ocurrió un error"}`
              );
            }
          } else {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setSubiendo(false);
            setResultado(prog.message || "Error al consultar el progreso.");
          }
        } catch (err) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setSubiendo(false);
          setResultado("Error de red al consultar el progreso.");
        }
      }, 1000);
    } catch (err) {
      setMensaje("");
      setResultado("Error de red o servidor.");
      setSubiendo(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <button
        className="w-[100px] border rounded-xl hover:bg-[#283847] h-10 font-medium duration-300"
        onClick={() => document.getElementById("importar-excel").click()}
        type="button"
        disabled={subiendo}
      >
        Importar
      </button>
      <input
        id="importar-excel"
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={subiendo}
      />
      {mensaje && <div>{mensaje}</div>}
      {progreso &&
        progreso.estado !== "finalizado" &&
        progreso.estado !== "error" && (
          <div>
            Analizados: {progreso.analizados}
            {typeof progreso.importados === "number" && (
              <> | Importados: {progreso.importados}</>
            )}
            {typeof progreso.saltados === "number" && (
              <> | Saltados: {progreso.saltados}</>
            )}
          </div>
        )}
      {resultado && <div>{resultado}</div>}
    </div>
  );
}

export default ImportarClientesExcel;