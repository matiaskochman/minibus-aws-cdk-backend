# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

A continuación se muestra el documento original modificado, integrando nuevos endpoints para que los **conductores** gestionen los **viajes**:

---

# 📌 Plan Modificado para la Aplicación de Transporte en Minibuses

## 🔍 **Descripción General**

La aplicación de transporte en minibuses tendrá cuatro componentes principales:

1. **App para Clientes**: Permite a los pasajeros buscar y comprar tickets para rutas creadas por conductores.
2. **App para Conductores**: Los conductores podrán crear, gestionar y operar sus propias rutas y viajes.
3. **App de Administración**: Gestiona conductores, rutas, pagos y puede aprobar rutas si es necesario.
4. **App para Vendedores**: Permite a los usuarios vendedores reclutar conductores y recibir una comisión por sus ventas durante un período determinado.

---

## 🏗 **Modificación Clave**

- **Conductores** podrán **crear y gestionar** sus propias rutas en lugar de que solo el administrador las establezca.
- Una ruta puede tener múltiples paradas, y los pasajeros pueden buscar viajes entre cualquier par de paradas dentro de una ruta existente.
- Los **tickets pueden ser revendidos** a otros clientes mediante un **marketplace**, donde se listan los tickets disponibles para reventa.
- Cada **viaje** puede activarse o desactivarse para permitir la reventa de tickets.
- Los **conductores pueden aplicar descuentos** a un viaje que aún no ha sido realizado; los tickets **no vendidos** recibirán el descuento, mientras que los tickets ya comprados **mantendrán su precio original**.
- Se agrega la posibilidad de que exista un **usuario vendedor**, quien recluta conductores y recibe una comisión por cada venta de los conductores que haya reclutado durante un tiempo determinado.
- Los **vendedores pueden asociarse a un conductor mediante la app de administración**.

---

## 📱 **1. App para Clientes (MVP)**

### ✅ Funcionalidades

- Registro e inicio de sesión.
- Búsqueda de rutas por origen, destino y fecha.
- Permite seleccionar cualquier parada intermedia como origen y destino.
- Visualización de horarios y asientos disponibles.
- Compra de tickets con pago integrado (tarjeta, billetera digital).
- **Reventa de tickets** en el marketplace si el viaje tiene la opción activada.
- **Aplicación automática de descuentos en tickets aún no vendidos.**
- Generación de ticket digital con **código QR** para validación.
- Notificaciones sobre la compra y recordatorios de viaje.

### 🔧 Tecnologías Clave

- **Google Maps API** para visualizar rutas y paradas.
- **Stripe, PayPal, Mercado Pago** para pagos.
- **Firebase** para notificaciones push.

---

## 🚗 **2. App para Conductores (MVP)**

### ✅ Funcionalidades

- Registro e inicio de sesión con validación de identidad.
- **Subida de documentación obligatoria:**
  - Foto del **DNI** del conductor.
  - Foto de la **documentación de la VTV** del minibús.
- **Creación de rutas** con origen, destino, múltiples paradas intermedias y horarios.
- **Cada dirección de viaje cuenta como una ruta independiente.**
- **Opción de activar o desactivar la reventa de tickets en cada viaje.**
- **Edición y eliminación** de rutas antes de que tenga pasajeros.
- **Historial de rutas creadas** y rendimiento.
- **Aplicación de descuentos** en tickets aún no vendidos.
- **Validación de tickets** mediante escaneo de **código QR**.
- **Actualización del estado** del viaje (inicio, finalización, retrasos).
- **Navegación integrada** con Google Maps/Waze.
- **Gestión de Viajes**:
  - Creación y planificación de viajes basados en rutas.
  - Actualización del estado del viaje en tiempo real.
- **Los conductores pueden estar asociados a un vendedor**, quien recibe una comisión por sus ventas.

## 🏢 **3. App de Administración (MVP)**

### ✅ Funcionalidades

- **Aprobación de rutas** creadas por conductores (opcional).
- **Verificación de documentos subidos por conductores** (DNI y VTV).
- **Monitoreo y gestión** de conductores.
- **Revisión y modificación de rutas** (si se requiere supervisión).
- **Gestión de tarifas y políticas de precios.**
- **Monitoreo financiero** de ventas y pagos.
- **Monitoreo del marketplace de reventa de tickets.**
- **Control de descuentos aplicados por los conductores.**
- **Soporte y resolución de incidencias.**
- **Monitoreo y asignación de comisiones a los vendedores.**
- **Asociación de vendedores a conductores para la gestión de comisiones.**

## 🏪 **4. App para Vendedores (MVP)**

### ✅ Funcionalidades

- Registro e inicio de sesión.
- Reclutamiento de conductores.
- Visualización de comisiones generadas por las ventas de los conductores asociados.
- **Asociación de conductores mediante la app de administración.**

## 🗄 **Base de Datos y Modelado**

### 📌 **Tablas Principales**

#### 🏷 **Usuarios**

| ID  | Nombre | Rol (Cliente/Conductor/Vendedor/Admin) | Teléfono | Email | Verificación | Telegram | Estado |
| --- | ------ | -------------------------------------- | -------- | ----- | ------------ | -------- | ------ |

#### 🚌 **Conductores**

| ID  | Usuario_ID | Foto_DNI | Foto_VTV | Estado (Pendiente/Aprobado) | Vendedor_ID |
| --- | ---------- | -------- | -------- | --------------------------- | ----------- |

#### 🏪 **Vendedores**

| ID  | Usuario_ID | Fecha_Registro | Comisión (%) | Duración_Comisión (meses) |
| --- | ---------- | -------------- | ------------ | ------------------------- |

#### 🛣 **Rutas**

| ID  | Conductor_ID | Dirección | Horario | Precio | Estado (Activa/Inactiva) | Descripción |
| --- | ------------ | --------- | ------- | ------ | ------------------------ | ----------- |

#### 🚗 **Viajes**

| ID  | Ruta_ID | Fecha | Conductor_ID | Estado (Pendiente/Cancelado/Realizado) | Descripción | Reventa_Activada (Sí/No) | Descuento (%) |
| --- | ------- | ----- | ------------ | -------------------------------------- | ----------- | ------------------------ | ------------- |

#### 💰 **Comisiones**

| ID  | Vendedor_ID | Conductor_ID | Ticket_ID | Monto_Comisión | Fecha |
| --- | ----------- | ------------ | --------- | -------------- | ----- |

---

## 🔄 **API y Comunicación entre Apps**

### 📌 **Endpoints Claves**

#### 🔹 **Para Vendedores**

- `POST /vendedores` → Registrar un nuevo vendedor.
- `GET /mis-conductores` → Ver la lista de conductores asociados.
- `POST /asociar-conductor` → Asociar un conductor a un vendedor mediante la app de administración.
- `GET /comisiones` → Ver las comisiones acumuladas.

#### 🔹 **Para Conductores**

- `POST /registro` → Subir DNI y VTV para validación.
- `POST /rutas` → Crear nueva ruta con múltiples paradas.
- `PUT /rutas/{id}` → Editar ruta existente.
- `DELETE /rutas/{id}` → Eliminar ruta antes de que tenga reservas.
- `PUT /viajes/{id}/descuento` → Aplicar descuento en tickets aún no vendidos.
- `GET /mis-rutas` → Ver rutas creadas.
- **Endpoints para Viajes:**
  - `POST /viajes` → Crear un nuevo viaje basado en una ruta existente.
  - `GET /mis-viajes` → Listar todos los viajes programados por el conductor.
  - `GET /viajes/{id}` → Obtener detalles de un viaje específico.
  - `PUT /viajes/{id}/estado` → Actualizar el estado del viaje (inicio, finalización, cancelación, retrasos).

#### 🔹 **Para Clientes**

- **Registro e Inicio de Sesión**
  - `POST /clientes/registro` → Registrar un nuevo cliente.
  - `POST /clientes/login` → Autenticación de cliente.
- **Búsqueda y Visualización de Rutas**
  - `GET /rutas?origen={origen}&destino={destino}&fecha={fecha}` → Buscar rutas disponibles según origen, destino y fecha.
  - `GET /rutas/{id}` → Obtener detalles de una ruta específica (incluyendo paradas, horarios y asientos disponibles).
- **Compra de Tickets y Gestión de Reservas**
  - `POST /tickets/compra` → Comprar un ticket para una ruta determinada.
  - `GET /tickets` → Listar los tickets adquiridos por el cliente.
  - `GET /tickets/{id}` → Obtener detalles de un ticket, incluyendo el código QR para validación.
- **Marketplace de Reventa de Tickets**
  - `GET /marketplace` → Listar tickets disponibles para reventa.
  - `POST /tickets/reventa` → Publicar un ticket en el marketplace para su reventa.
  - `POST /tickets/recompra` → Comprar un ticket que se encuentra en reventa.
- **Notificaciones y Seguimiento**
  - `GET /notificaciones` → Listar notificaciones relacionadas con la compra de tickets y recordatorios de viaje.

#### 🔹 **Para Administración**

- **Autenticación y Gestión de Sesión**
  - `POST /admin/login` → Inicio de sesión para administradores.
  - `POST /admin/logout` → Cierre de sesión.
- **Gestión de Conductores**
  - `GET /admin/conductores` → Listar todos los conductores registrados.
  - `GET /admin/conductores/{id}` → Obtener detalles de un conductor (incluyendo documentos: DNI y VTV).
  - `PUT /admin/conductores/{id}/estado` → Actualizar el estado de un conductor (por ejemplo, aprobar o rechazar la validación de documentos).
- **Gestión de Rutas y Viajes**
  - `GET /admin/rutas` → Listar todas las rutas creadas por conductores.
  - `PUT /admin/rutas/{id}` → Aprobar, editar o rechazar rutas según corresponda.
  - `DELETE /admin/rutas/{id}` → Eliminar rutas que no hayan sido aprobadas o tengan incidencias.
  - `GET /admin/viajes` → Listar todos los viajes programados, con detalles sobre estado, descuentos y activación de reventa.
- **Control Financiero y Comisiones**
  - `GET /admin/ventas` → Revisar todas las ventas de tickets.
  - `GET /admin/comisiones` → Listar y filtrar las comisiones generadas por vendedores.
  - `POST /admin/asociar-vendedor` → Asociar un vendedor a un conductor para la gestión de comisiones.
- **Supervisión del Marketplace**
  - `GET /admin/marketplace` → Supervisar los tickets en reventa.
  - `PUT /admin/marketplace/{ticketId}` → Modificar o eliminar un ticket en reventa en caso de incidencias.
- **Soporte y Resolución de Incidencias**
  - `GET /admin/incidencias` → Listar incidencias reportadas.
  - `POST /admin/incidencias` → Registrar una nueva incidencia o reporte de anomalía en el sistema.

---

## 🏁 **Conclusión**

La aplicación ahora integra un completo ecosistema para gestionar:

- **Clientes**: Búsqueda, compra y reventa de tickets, con aplicación de descuentos y notificaciones.
- **Conductores**: Creación y gestión de rutas y viajes, validación de documentos, actualización de estados y aplicación de descuentos en viajes.
- **Administradores**: Supervisión y aprobación de rutas, validación de documentos, gestión financiera, incidencias y asociaciones entre vendedores y conductores.
- **Vendedores**: Reclutamiento de conductores y seguimiento de comisiones por ventas.

🚀 **Próximo paso**: Implementar la interfaz de administración para gestionar las asociaciones de vendedores y optimizar la experiencia en cada uno de los módulos.

docker compose down -v && docker compose up -d
./scripts/init-localstack.sh

# Ejecutar desde la raíz del proyecto

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

cdklocal bootstrap
cdklocal deploy --require-approval never

cdklocal destroy --require-approval never

awslocal dynamodb list-tables
awslocal s3 ls
awslocal apigateway get-rest-apis
