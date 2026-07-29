import React from 'react'

export const IotModule: React.FC = () => {
  return (
    <section className="module-panel">
      <div className="module-cards">
        <article>
          <h3>Sensores activos</h3>
          <p>24</p>
        </article>
        <article>
          <h3>Alertas abiertas</h3>
          <p>2</p>
        </article>
        <article>
          <h3>Disponibilidad</h3>
          <p>99.7%</p>
        </article>
        <article>
          <h3>Incidentes hoy</h3>
          <p>1</p>
        </article>
      </div>

      <div className="info-grid" style={{ marginTop: '24px' }}>
        <article>
          <h3>Monitoreo de Cámaras Frías</h3>
          <p>Cuarto Frío Principal Carnes: <strong>3.2 °C</strong> (Normal)</p>
          <small>Última lectura: hace 2 minutos</small>
        </article>
        <article>
          <h3>Apertura de Puertas</h3>
          <p>Congelador Repostería: <strong>Puerta cerrada</strong></p>
          <small>Humedad: 65%</small>
        </article>
      </div>
    </section>
  )
}