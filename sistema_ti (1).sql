DROP DATABASE IF EXISTS sistema_ti;

create database sistema_ti;
use sistema_ti;

/*MODULO 1*/

CREATE TABLE personal (
    id_personal BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) DEFAULT NULL,
    correo VARCHAR(255) NOT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_personal),
    UNIQUE KEY uk_personal_correo (correo)
);

CREATE TABLE marcas_equipo (
    id_marca BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre_marca VARCHAR(100) NOT NULL,
    pais_origen VARCHAR(100) DEFAULT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_marca)
);
CREATE TABLE modelos (
    id_modelo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre_modelo VARCHAR(100) NOT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_modelo)
);
CREATE TABLE equipos (
    id_equipo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    numero_serie VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT NULL,
    accesorios TEXT DEFAULT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    id_marca BIGINT UNSIGNED NOT NULL,
    id_modelo BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_equipo),

    UNIQUE KEY uk_equipos_numero_serie (numero_serie),

    KEY equipos_id_marca_foreign (id_marca),
    KEY equipos_id_modelo_foreign (id_modelo),
    FOREIGN KEY (id_marca) REFERENCES marcas_equipo(id_marca),
    FOREIGN KEY (id_modelo) REFERENCES modelos(id_modelo)
);

CREATE TABLE clientes (
    id_cliente BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    telefono VARCHAR(20) DEFAULT NULL,
    correo VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) DEFAULT NULL,
    nit_ci VARCHAR(30) NOT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_cliente),
    UNIQUE KEY uk_clientes_correo (correo),
    UNIQUE KEY uk_clientes_nit_ci (nit_ci)
);

CREATE TABLE orden_servicio (
    id_orden BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    fecha_ingreso DATE NOT NULL,
    fecha_entrega DATE DEFAULT NULL,
    problema_reportado TEXT NOT NULL,
    costo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado ENUM('pendiente', 'en_proceso', 'finalizada', 'Anulado') NOT NULL DEFAULT 'pendiente',
    id_cliente BIGINT UNSIGNED NOT NULL,
    id_personal BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_orden),

    KEY detalle_orden_servicio_id_cliente_foreign (id_cliente),
    KEY detalle_orden_servicio_id_personal_foreign (id_personal),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_personal) REFERENCES personal(id_personal)
    
);
CREATE TABLE diagnosticos (
    id_diagnostico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_orden BIGINT UNSIGNED NOT NULL,
    id_equipo BIGINT UNSIGNED NOT NULL,
    descripcion TEXT NOT NULL,
    solucion TEXT DEFAULT NULL,
    fecha DATE NOT NULL,
    observacion TEXT DEFAULT NULL,
    estado ENUM('pendiente','confirmado','reparado')
        NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_diagnostico),

    KEY diagnosticos_id_orden_foreign (id_orden),

    FOREIGN KEY (id_orden)
        REFERENCES orden_servicio(id_orden)
        ON DELETE CASCADE,

    FOREIGN KEY(id_equipo) REFERENCES equipos(id_equipo)
);

/* MODULO 3 */
create table usuarios (
 
    id_usuario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_personal bigint unsigned not null,
    nombres varchar(50),
    apellidos varchar(50),
    correo varchar(50),
    contrasena varchar(50),
    estado tinyint(1) default 1,
    created_at timestamp null default null,
    updated_at timestamp null default null,
    UNIQUE KEY uk_usuarios_correo (correo),
    FOREIGN KEY (id_personal) REFERENCES personal(id_personal) ON DELETE CASCADE
);
create table roles(

    id_roles BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    descripcion varchar(50),
    estado tinyint(1) default 1,
    created_at timestamp null default null,
    updated_at timestamp null default null

);
create table rol_usuario(

    id_usuario BIGINT UNSIGNED not null,
    id_roles BIGINT UNSIGNED NOT null,
    estado tinyint(1) default 1,
    
    
    PRIMARY KEY(id_usuario, id_roles),
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY(id_roles) REFERENCES roles(id_roles)

);
create table categorias (

    id_categoria BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(50),
    descripcion varchar(100),
    estado TINYINT(1) DEFAULT 1,
    created_at timestamp null default null,
    updated_at timestamp null default null
);

create table repuestos(

    id_repuesto BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_categoria BIGINT UNSIGNED NOT NULL,
    
    
    nombre varchar(50),
    descripcion varchar(100),
    precio_venta decimal(10,2),
    stock BIGINT not null,
    modelo varchar(50),
    precio_compra decimal(10,2),
    unidad_medida varchar(20),
    marca varchar(25),
    codigo varchar(25),
    estado TINYINT(1) DEFAULT 1,
    created_at timestamp null default null,
    updated_at timestamp null default null,
    
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)

);
create table ventas(

    id_venta BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_cliente BIGINT UNSIGNED not null,
    id_usuario BIGINT UNSIGNED not null, 
    
    metodo_pago varchar(20) not null,
    fecha date NOT null, 
    observacion varchar(50),
    total decimal(10,2),
    estado TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE table detalle_venta(

    
    id_detalle_venta BIGINT UNSIGNED AUTO_INCREMENT PRIMARY key,
    id_venta BIGINT UNSIGNED not null,
    id_repuesto BIGINT UNSIGNED not null,
    
    descuento decimal(10,2),
    subtotal decimal(10,2),
    cantidad BIGINT not null,
    precio_unitario decimal(10,2),
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    
    
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
    FOREIGN KEY (id_repuesto) REFERENCES repuestos(id_repuesto)

);

/* MODULO 2*/

create table proveedores (
    id_proveedor bigint unsigned not null auto_increment,
    nombre varchar(255) not null,
    nit varchar(255) not null,
    departamento varchar(255) default null,
    direccion varchar(255) default null,
    correo varchar(255) not null,
    celular varchar(255) default null,
    fecha_registro timestamp not null default current_timestamp,
    estado tinyint(1) not null default 1,
    created_at timestamp null default null,
    updated_at timestamp null default null,
    primary key (id_proveedor),
    unique key nit (nit),
    unique key correo (correo)
);

create table compras (
    id_compra BIGINT unsigned not null auto_increment,
    n_documento varchar(50) not null,
    id_proveedor BIGINT UNSIGNED not null,
    id_usuario BIGINT UNSIGNED not null,
    total_compra decimal(10,2) not null,
    forma_pago varchar(50) not null,
    observacion text,
    fecha date not null,
    estado tinyint(1) not null default 1,
    created_at timestamp null default null,
    updated_at timestamp null default null,
    primary key (id_compra),
    unique key n_documento (n_documento),
    key compras_id_proveedor_foreign (id_proveedor),

    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
);



create table detalle_compras (
    id_detalle_compra bigint unsigned not null auto_increment,
    precio decimal(10,2) not null,
    sub_total decimal(10,2) not null,
    estado tinyint(1) not null default 1,
    cantidad BIGINT not null,
    id_compra BIGINT UNSIGNED not null,
    id_repuesto BIGINT UNSIGNED not null,
    created_at timestamp null default null,
    updated_at timestamp null default null,
    primary key (id_detalle_compra),
    key detalle_compras_id_compra_foreign (id_compra),

    FOREIGN KEY (id_repuesto) REFERENCES repuestos(id_repuesto),

     FOREIGN KEY (id_compra) REFERENCES compras(id_compra)
);

create table ofertas (
    id_oferta bigint unsigned not null auto_increment,
    of_nombre varchar(100) not null,
    descripcion text,
    porcentaje decimal(5,2) not null,
    fecha_inc date not null,
    fecha_fin date not null,
    estado tinyint(1) not null default 1,
    created_at timestamp null default null,
    updated_at timestamp null default null,
    primary key (id_oferta),
    key fecha_inc (fecha_inc, fecha_fin)
);


CREATE TABLE cotizaciones (
    id_cotizacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_orden BIGINT UNSIGNED not NULL,
    id_oferta BIGINT UNSIGNED DEFAULT NULL,
    id_cliente BIGINT UNSIGNED not null,
    id_usuario BIGINT UNSIGNED not NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    fecha_cad DATE NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id_cotizacion),
    KEY cotizaciones_id_oferta_foreign (id_oferta),

    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_orden) REFERENCES orden_servicio(id_orden),

     FOREIGN KEY (id_oferta) REFERENCES ofertas(id_oferta)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE detalle_cotizaciones (
    id_detalle_cotizacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_cotizacion BIGINT UNSIGNED NOT NULL,
    id_equipo BIGINT UNSIGNED NOT NULL,
    id_repuesto BIGINT UNSIGNED DEFAULT NULL,
    precio DECIMAL(10,2) NOT NULL,
    cantidad BIGINT NOT NULL,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_detalle_cotizacion),

    FOREIGN KEY (id_cotizacion)
        REFERENCES cotizaciones(id_cotizacion)
        ON DELETE CASCADE,

    FOREIGN KEY (id_equipo)
        REFERENCES equipos(id_equipo)
        ON DELETE RESTRICT,

    FOREIGN KEY (id_repuesto)
        REFERENCES repuestos(id_repuesto)
        ON DELETE SET NULL
);

/*MODULO 5*/
CREATE TABLE categorias_herramientas (
    id_categoria_herramienta BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    requiere_certificacion TINYINT(1) NOT NULL DEFAULT 0,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_categoria_herramienta),

    UNIQUE KEY uk_categoria_herramienta_nombre (nombre)
);
CREATE TABLE herramientas (
    id_herramienta BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_categoria_herramienta BIGINT UNSIGNED NOT NULL,

    nombre VARCHAR(100) NOT NULL,
    nro_serie_interno VARCHAR(100) NOT NULL,

    estado_fisico ENUM(
        'excelente',
        'bueno',
        'regular',
        'malo'
    ) NOT NULL DEFAULT 'bueno',

    estado TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_herramienta),

    UNIQUE KEY uk_herramienta_serie (nro_serie_interno),

    KEY herramientas_categoria_foreign (id_categoria_herramienta),

    CONSTRAINT herramientas_categoria_foreign
        FOREIGN KEY (id_categoria_herramienta)
        REFERENCES categorias_herramientas(id_categoria_herramienta)
        ON DELETE RESTRICT
);
CREATE TABLE mantenimientos (
    id_mantenimiento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    tarifa_base DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tiempo_estimado INT DEFAULT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_mantenimiento),

    UNIQUE KEY uk_mantenimiento_nombre (nombre)
);

CREATE TABLE trabajos_mantenimiento (
    id_trabajo_mantenimiento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    id_diagnostico BIGINT UNSIGNED NOT NULL,
    id_mantenimiento BIGINT UNSIGNED NOT NULL,

    fecha_programada DATE DEFAULT NULL,
    fecha_inicio DATETIME DEFAULT NULL,
    fecha_fin DATETIME DEFAULT NULL,

    observaciones TEXT DEFAULT NULL,

    estado ENUM(
        'pendiente',
        'en_proceso',
        'finalizado',
        'cancelado'
    ) NOT NULL DEFAULT 'pendiente',

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_trabajo_mantenimiento),

    KEY trabajos_diagnostico_foreign (id_diagnostico),
    KEY trabajos_mantenimiento_foreign (id_mantenimiento),

    CONSTRAINT trabajos_diagnostico_foreign
        FOREIGN KEY (id_diagnostico)
        REFERENCES diagnosticos(id_diagnostico)
        ON DELETE CASCADE,

    CONSTRAINT trabajos_mantenimiento_foreign
        FOREIGN KEY (id_mantenimiento)
        REFERENCES mantenimientos(id_mantenimiento)
        ON DELETE RESTRICT
);
CREATE TABLE asignaciones (
    id_asignacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_trabajo_mantenimiento BIGINT UNSIGNED NOT NULL,
    id_personal BIGINT UNSIGNED NOT NULL,
    rol_asignacion VARCHAR(50) NOT NULL,
    horas_invertidas DECIMAL(5,2) DEFAULT 0.00,
    fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_asignacion),

    KEY asignaciones_trabajo_foreign (id_trabajo_mantenimiento),
    KEY asignaciones_personal_foreign (id_personal),

    CONSTRAINT asignaciones_trabajo_foreign
        FOREIGN KEY (id_trabajo_mantenimiento)
        REFERENCES trabajos_mantenimiento(id_trabajo_mantenimiento)
        ON DELETE CASCADE,

    CONSTRAINT asignaciones_personal_foreign
        FOREIGN KEY (id_personal)
        REFERENCES personal(id_personal)
        ON DELETE RESTRICT
);
CREATE TABLE trabajo_herramientas (
    id_trabajo_herramienta BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_trabajo_mantenimiento BIGINT UNSIGNED NOT NULL,
    id_herramienta BIGINT UNSIGNED NOT NULL,
    observacion VARCHAR(255) DEFAULT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_trabajo_herramienta),

    KEY trabajo_herramientas_trabajo_foreign (id_trabajo_mantenimiento),
    KEY trabajo_herramientas_herramienta_foreign (id_herramienta),

    CONSTRAINT trabajo_herramientas_trabajo_foreign
        FOREIGN KEY (id_trabajo_mantenimiento)
        REFERENCES trabajos_mantenimiento(id_trabajo_mantenimiento)
        ON DELETE CASCADE,

    CONSTRAINT trabajo_herramientas_herramienta_foreign
        FOREIGN KEY (id_herramienta)
        REFERENCES herramientas(id_herramienta)
        ON DELETE RESTRICT
);
CREATE TABLE trabajo_repuestos (
    id_trabajo_repuesto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_trabajo_mantenimiento BIGINT UNSIGNED NOT NULL,
    id_repuesto BIGINT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL DEFAULT 1,
    observacion VARCHAR(255) DEFAULT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_trabajo_repuesto),

    KEY trabajo_repuestos_trabajo_foreign (id_trabajo_mantenimiento),
    KEY trabajo_repuestos_repuesto_foreign (id_repuesto),

    CONSTRAINT trabajo_repuestos_trabajo_foreign
        FOREIGN KEY (id_trabajo_mantenimiento)
        REFERENCES trabajos_mantenimiento(id_trabajo_mantenimiento)
        ON DELETE CASCADE,

    CONSTRAINT trabajo_repuestos_repuesto_foreign
        FOREIGN KEY (id_repuesto)
        REFERENCES repuestos(id_repuesto)
        ON DELETE RESTRICT
);

/*MODULO 4*/

-- ============================================================
-- VERSIÓN MEJORADA (COMBINACIÓN DE AMBOS DISEÑOS)
-- ============================================================

-- 1. INVENTARIO (de tu compañero, pero con id_usuario)
CREATE TABLE inventario (
    id_inventario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_repuesto BIGINT UNSIGNED NOT NULL,
    fecha_registro DATE NOT NULL,
    stock_minimo INT NOT NULL DEFAULT 0,
    stock_maximo INT NOT NULL,
    ubicacion VARCHAR(100) DEFAULT NULL,
    observacion VARCHAR(255) DEFAULT NULL,
    id_usuario_creacion BIGINT UNSIGNED NOT NULL,  -- Agregado de tu diseño
    estado TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_inventario),
    UNIQUE KEY uk_id_repuesto (id_repuesto),
    
    FOREIGN KEY (id_repuesto) REFERENCES repuestos(id_repuesto),
    FOREIGN KEY (id_usuario_creacion) REFERENCES usuarios(id_usuario),
    
    CONSTRAINT chk_inventario_stock_minimo CHECK (stock_minimo >= 0),
    CONSTRAINT chk_inventario_stock_maximo CHECK (stock_maximo >= stock_minimo)
);

-- 2. LOTE_STOCK (de tu compañero, pero con relación a detalle_compra)
CREATE TABLE lote_stock (
    id_lote_stock BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo_lote VARCHAR(30) NOT NULL,
    id_detalle_compra BIGINT UNSIGNED NOT NULL,  -- Agregado de tu diseño
    fecha_ingreso DATE NOT NULL,
    cantidad_inicial INT NOT NULL,
    cantidad_disponible INT NOT NULL,
    costo_unitario DECIMAL(10,2) DEFAULT NULL,
    fecha_vencimiento DATE DEFAULT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    observacion VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_lote_stock),
    UNIQUE KEY uk_lote_stock_codigo (codigo_lote),
    
    FOREIGN KEY (id_detalle_compra) REFERENCES detalle_compras(id_detalle_compra),
    
    CONSTRAINT chk_lote_cantidad_inicial CHECK (cantidad_inicial >= 0),
    CONSTRAINT chk_lote_cantidad_disponible CHECK (cantidad_disponible >= 0 AND cantidad_disponible <= cantidad_inicial),
    CONSTRAINT chk_lote_costo_unitario CHECK (costo_unitario IS NULL OR costo_unitario >= 0),
    CONSTRAINT chk_lote_fecha_vencimiento CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento >= fecha_ingreso),
    CONSTRAINT chk_lote_estado CHECK (estado IN ('ACTIVO', 'AGOTADO', 'VENCIDO', 'INACTIVO'))
);

-- 3. KARDEX (lo mejor de ambos)
CREATE TABLE kardex (
    id_kardex BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_inventario BIGINT UNSIGNED NOT NULL,  -- de tu compañero
    id_lote_stock BIGINT UNSIGNED NOT NULL,  -- de tu compañero
    
    -- Origen del movimiento (de tu diseño)
    id_detalle_compra BIGINT UNSIGNED DEFAULT NULL,
    id_detalle_venta BIGINT UNSIGNED DEFAULT NULL,
    id_trabajo_repuesto BIGINT UNSIGNED DEFAULT NULL,
    
    id_usuario BIGINT UNSIGNED NOT NULL,  -- de tu diseño
    
    tipo_movimiento ENUM('ENTRADA','SALIDA','AJUSTE') NOT NULL,  -- de tu compañero
    cantidad_entrada INT NOT NULL DEFAULT 0,  -- de tu compañero
    cantidad_salida INT NOT NULL DEFAULT 0,  -- de tu compañero
    saldo_anterior INT NOT NULL DEFAULT 0,
    saldo_actual INT NOT NULL DEFAULT 0,
    concepto VARCHAR(100) DEFAULT NULL,
    referencia VARCHAR(50) DEFAULT NULL,
    observacion VARCHAR(255) DEFAULT NULL,
    fecha_movimiento DATETIME NOT NULL,  -- de tu compañero
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_kardex),
    
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario),
    FOREIGN KEY (id_lote_stock) REFERENCES lote_stock(id_lote_stock),
    FOREIGN KEY (id_detalle_compra) REFERENCES detalle_compras(id_detalle_compra),
    FOREIGN KEY (id_detalle_venta) REFERENCES detalle_venta(id_detalle_venta),
    FOREIGN KEY (id_trabajo_repuesto) REFERENCES trabajo_repuestos(id_trabajo_repuesto),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    
    CONSTRAINT chk_kardex_tipo_movimiento CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    CONSTRAINT chk_kardex_cantidades CHECK (cantidad_entrada >= 0 AND cantidad_salida >= 0),
    CONSTRAINT chk_kardex_movimiento CHECK (
        (tipo_movimiento = 'ENTRADA' AND cantidad_entrada > 0 AND cantidad_salida = 0) OR
        (tipo_movimiento = 'SALIDA' AND cantidad_salida > 0 AND cantidad_entrada = 0) OR
        (tipo_movimiento = 'AJUSTE' AND ((cantidad_entrada > 0 AND cantidad_salida = 0) OR (cantidad_salida > 0 AND cantidad_entrada = 0)))
    ),
    CONSTRAINT chk_kardex_saldos CHECK (saldo_anterior >= 0 AND saldo_actual >= 0 AND saldo_actual = saldo_anterior + cantidad_entrada - cantidad_salida)
);

-- 4. INVENTARIO_FISICO (tu diseño mejorado)
CREATE TABLE inventario_fisico (
    id_inventario_fisico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_inventario BIGINT UNSIGNED NOT NULL,  -- de tu compañero
    id_usuario BIGINT UNSIGNED NOT NULL,  -- de tu diseño
    fecha_conteo DATETIME NOT NULL,  -- de tu compañero
    stock_sistema BIGINT UNSIGNED NOT NULL,  -- de tu diseño
    stock_contado BIGINT UNSIGNED NOT NULL,  -- de tu diseño
    diferencia BIGINT NOT NULL,
    resultado VARCHAR(20) NOT NULL,  -- de tu compañero
    observacion VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id_inventario_fisico),
    
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    
    CONSTRAINT chk_inventario_fisico_cantidad CHECK (stock_contado >= 0),
    CONSTRAINT chk_inventario_fisico_resultado CHECK (
        (diferencia < 0 AND resultado = 'FALTANTE') OR
        (diferencia > 0 AND resultado = 'SOBRANTE') OR
        (diferencia = 0 AND resultado = 'CONFORME')
    )
);

-- ============================================================
-- SCRIPT DE INSERCIÓN DE DATOS PARA TI_SISTEM (VERSIÓN MEJORADA)
-- ============================================================

USE sistema_ti;

-- ============================================================
-- 1. DATOS DEL MÓDULO PERSONAL
-- ============================================================

INSERT INTO personal (nombre, apellido, cargo, telefono, correo, estado, created_at) VALUES
('Juan', 'Pérez', 'Técnico Senior', '77712345', 'juan.perez@ti.com', 1, NOW()),
('María', 'González', 'Técnico Junior', '77712346', 'maria.gonzalez@ti.com', 1, NOW()),
('Carlos', 'Rodríguez', 'Supervisor', '77712347', 'carlos.rodriguez@ti.com', 1, NOW()),
('Ana', 'Martínez', 'Técnico Senior', '77712348', 'ana.martinez@ti.com', 1, NOW()),
('Luis', 'Fernández', 'Vendedor', '77712349', 'luis.fernandez@ti.com', 1, NOW()),
('Laura', 'Torres', 'Administrador', '77712350', 'laura.torres@ti.com', 1, NOW());

-- ============================================================
-- 2. DATOS DEL MÓDULO MARCAS Y MODELOS
-- ============================================================

INSERT INTO marcas_equipo (nombre_marca, pais_origen, estado, created_at) VALUES
('HP', 'Estados Unidos', 1, NOW()),
('Dell', 'Estados Unidos', 1, NOW()),
('Lenovo', 'China', 1, NOW()),
('Apple', 'Estados Unidos', 1, NOW()),
('Samsung', 'Corea del Sur', 1, NOW()),
('Acer', 'Taiwán', 1, NOW());

INSERT INTO modelos (nombre_modelo, estado, created_at) VALUES
('Pavilion 15', 1, NOW()),
('Latitude 5400', 1, NOW()),
('ThinkPad T14', 1, NOW()),
('MacBook Air', 1, NOW()),
('Galaxy Book', 1, NOW()),
('Aspire 5', 1, NOW());

-- ============================================================
-- 3. DATOS DEL MÓDULO EQUIPOS
-- ============================================================

INSERT INTO equipos (numero_serie, color, accesorios, estado, id_marca, id_modelo, created_at) VALUES
('SN001-HP', 'Plateado', 'Cargador, Mouse', 1, 1, 1, NOW()),
('SN002-DELL', 'Negro', 'Cargador, Funda', 1, 2, 2, NOW()),
('SN003-LENOVO', 'Gris', 'Cargador', 1, 3, 3, NOW()),
('SN004-APPLE', 'Oro', 'Cargador, Adaptador', 1, 4, 4, NOW()),
('SN005-SAMSUNG', 'Azul', 'Cargador, Teclado', 1, 5, 5, NOW()),
('SN006-HP', 'Blanco', 'Cargador', 1, 1, 1, NOW()),
('SN007-DELL', 'Plateado', 'Cargador, Mouse', 1, 2, 2, NOW()),
('SN008-ACER', 'Negro', 'Cargador', 1, 6, 6, NOW());

-- ============================================================
-- 4. DATOS DEL MÓDULO CLIENTES
-- ============================================================

INSERT INTO clientes (nombre, apellido, telefono, correo, direccion, nit_ci, estado, created_at) VALUES
('Empresa', 'ABC', '77765432', 'contacto@empresaabc.com', 'Av. Principal 123', '123456789', 1, NOW()),
('María', 'López', '77765433', 'maria.lopez@gmail.com', 'Calle 2 #45', '987654321', 1, NOW()),
('Tecnología', 'XYZ', '77765434', 'info@tecnologiaxyz.com', 'Zona Norte 789', '456789123', 1, NOW()),
('Pedro', 'Ramírez', '77765435', 'pedro.ramirez@hotmail.com', 'Av. Central 567', '789123456', 1, NOW()),
('Consultora', 'Sistemas', '77765436', 'contacto@consultora.com', 'Oficina 101', '321654987', 1, NOW()),
('Juan', 'Mendoza', '77765437', 'juan.mendoza@yahoo.com', 'Calle 5 #123', '654789321', 1, NOW());

-- ============================================================
-- 5. DATOS DEL MÓDULO ORDENES DE SERVICIO
-- ============================================================

INSERT INTO orden_servicio (fecha_ingreso, fecha_entrega, problema_reportado, costo, estado, id_cliente, id_personal, created_at) VALUES
('2026-01-10', '2026-01-15', 'Equipo no enciende', 150.00, 'finalizada', 1, 1, NOW()),
('2026-01-12', '2026-01-18', 'Pantalla con líneas verticales', 200.00, 'en_proceso', 2, 2, NOW()),
('2026-01-15', '2026-01-20', 'Batería no retiene carga', 100.00, 'pendiente', 3, 1, NOW()),
('2026-01-18', '2026-01-25', 'Teclado no funciona', 120.00, 'pendiente', 4, 3, NOW()),
('2026-01-20', '2026-01-28', 'Sistema operativo no arranca', 180.00, 'Anulado', 5, 2, NOW()),
('2026-01-22', '2026-01-30', 'Sobrecalentamiento', 90.00, 'pendiente', 6, 4, NOW());

-- ============================================================
-- 6. DATOS DEL MÓDULO DIAGNÓSTICOS
-- ============================================================

INSERT INTO diagnosticos (id_orden, id_equipo, descripcion, solucion, fecha, observacion, estado, created_at) VALUES
(1, 1, 'La placa madre no recibe energía', 'Reemplazo de fuente de poder', '2026-01-11', 'Cliente aprobó reparación', 'reparado', NOW()),
(2, 2, 'Pantalla dañada físicamente', 'Cambio de pantalla completa', '2026-01-13', 'Esperando repuesto', 'pendiente', NOW()),
(3, 3, 'Batería desgastada por uso', 'Reemplazo de batería original', '2026-01-16', 'Se necesita pedido', 'confirmado', NOW()),
(4, 4, 'Falla en cable flex del teclado', 'Reparación de conexión', '2026-01-19', 'Reparación sencilla', 'pendiente', NOW()),
(5, 5, 'Disco duro dañado', 'Cambio de disco por SSD', '2026-01-21', 'Esperando aprobación', 'pendiente', NOW()),
(6, 6, 'Ventilador obstruido', 'Limpieza y mantenimiento', '2026-01-23', 'Pendiente de programación', 'pendiente', NOW());

-- ============================================================
-- 7. DATOS DEL MÓDULO USUARIOS Y ROLES
-- ============================================================

INSERT INTO roles (descripcion, estado, created_at) VALUES
('Administrador', 1, NOW()),
('Técnico', 1, NOW()),
('Vendedor', 1, NOW()),
('Supervisor', 1, NOW());

INSERT INTO usuarios (id_personal, nombres, apellidos, correo, contrasena, estado, created_at) VALUES
(1, 'Juan', 'Perez', 'jperez@ti.com', '123456', 1, NOW()),
(2, 'María', 'Gonzalez', 'mgonzalez@ti.com', '123456', 1, NOW()),
(3, 'Carlos', 'Rodriguez', 'crodriguez@ti.com', '123456', 1, NOW()),
(4, 'Laura', 'Torres', 'ltorres@ti.com', '123456', 1, NOW()),
(5, 'Luis', 'Fernandez', 'lfernandez@ti.com', '123456', 1, NOW()),
(6, 'Ana', 'Martinez', 'amartinez@ti.com', '123456', 1, NOW());

INSERT INTO rol_usuario (id_usuario, id_roles, estado) VALUES
(1, 1, 1),  -- Juan - Admin
(2, 2, 1),  -- María - Técnico
(3, 4, 1),  -- Carlos - Supervisor
(4, 1, 1),  -- Laura - Admin
(5, 3, 1),  -- Luis - Vendedor
(6, 2, 1);  -- Ana - Técnico

-- ============================================================
-- 8. DATOS DEL MÓDULO CATEGORÍAS Y REPUESTOS
-- ============================================================

INSERT INTO categorias (nombre, descripcion, estado, created_at) VALUES
('Baterias', 'Baterias para laptops y dispositivos', 1, NOW()),
('Pantallas', 'Pantallas LCD, LED, OLED', 1, NOW()),
('Discos Duros', 'HDD y SSD', 1, NOW()),
('Memorias RAM', 'Módulos de memoria', 1, NOW()),
('Teclados', 'Teclados internos y externos', 1, NOW()),
('Cargadores', 'Cargadores y adaptadores', 1, NOW()),
('Ventiladores', 'Ventiladores para equipos', 1, NOW());

INSERT INTO repuestos (
    id_categoria, nombre, descripcion, precio_venta, stock, 
    modelo, precio_compra, unidad_medida, marca, codigo, estado, created_at
) VALUES 
(1, 'Bateria HP Pavilion', 'Batería original 11.1V 4400mAh', 120.00, 15, 'HP Pavilion 15', 80.00, 'Unidad', 'HP', 'BAT-HP-001', 1, NOW()),
(1, 'Bateria Dell Latitude', 'Batería 14.8V 6600mAh', 150.00, 10, 'Dell Latitude', 100.00, 'Unidad', 'Dell', 'BAT-DELL-001', 1, NOW()),
(2, 'Pantalla 15.6 LCD', 'Pantalla HD 1366x768', 180.00, 8, 'HP Pavilion', 120.00, 'Unidad', 'LG', 'PAN-HP-001', 1, NOW()),
(3, 'SSD 500GB', 'Disco sólido SATA III', 85.00, 25, 'Crucial MX500', 55.00, 'Unidad', 'Crucial', 'SSD-500-001', 1, NOW()),
(3, 'HDD 1TB', 'Disco duro 7200RPM', 70.00, 12, 'Western Digital', 45.00, 'Unidad', 'WD', 'HDD-1TB-001', 1, NOW()),
(4, 'RAM 8GB DDR4', 'Módulo 2666MHz', 65.00, 20, 'Kingston', 40.00, 'Unidad', 'Kingston', 'RAM-8GB-001', 1, NOW()),
(5, 'Teclado MacBook', 'Teclado retroiluminado', 90.00, 5, 'MacBook Air', 60.00, 'Unidad', 'Apple', 'TEC-MAC-001', 1, NOW()),
(6, 'Cargador HP 65W', 'Cargador USB-C', 55.00, 18, 'HP 65W', 35.00, 'Unidad', 'HP', 'CAR-HP-001', 1, NOW()),
(7, 'Ventilador HP', 'Ventilador de CPU', 35.00, 10, 'HP Pavilion', 22.00, 'Unidad', 'HP', 'VENT-HP-001', 1, NOW());
-- ============================================================
-- 9. DATOS DEL MÓDULO PROVEEDORES
-- ============================================================

INSERT INTO proveedores (nombre, nit, departamento, direccion, correo, celular, estado, created_at) VALUES
('Importadora Global SA', '123456789', 'La Paz', 'Av. Las Americas 123', 'ventas@importadora.com', '77711111', 1, NOW()),
('Tecnología Total', '987654321', 'Santa Cruz', 'Calle 21 Nu 456', 'info@tecnologiatotal.com', '77722222', 1, NOW()),
('Repuestos Express', '456789123', 'Cochabamba', 'Av. Libertador 789', 'contacto@repuestosexpress.com', '77733333', 1, NOW()),
('Distribuidora Central', '789123456', 'La Paz', 'Zona Sur 101', 'distribuidora@central.com', '77744444', 1, NOW());

-- ============================================================
-- 10. DATOS DEL MÓDULO COMPRAS
-- ============================================================

INSERT INTO compras (n_documento, id_proveedor, id_usuario, total_compra, forma_pago, observacion, fecha, estado, created_at) VALUES
('COMP-001', 1, 1, 380.00, 'Transferencia', 'Compra de baterías y SSD', '2026-01-05', 1, NOW()),
('COMP-002', 2, 2, 240.00, 'Efectivo', 'Compra de pantallas', '2026-01-08', 1, NOW()),
('COMP-003', 3, 3, 280.00, 'Credito', 'Compra de RAM y cargadores', '2026-01-12', 1, NOW()),
('COMP-004', 4, 1, 450.00, 'Transferencia', 'Compra de discos duros', '2026-01-15', 1, NOW()),
('COMP-005', 1, 2, 180.00, 'Efectivo', 'Compra de teclados Apple', '2026-01-18', 1, NOW()),
('COMP-006', 2, 6, 110.00, 'Transferencia', 'Compra de ventiladores', '2026-01-20', 1, NOW());

INSERT INTO detalle_compras (precio, sub_total, estado, cantidad, id_compra, id_repuesto, created_at) VALUES
(80.00, 160.00, 1, 2, 1, 1, NOW()),
(55.00, 220.00, 1, 4, 1, 4, NOW()),
(120.00, 240.00, 1, 2, 2, 3, NOW()),
(40.00, 80.00, 1, 2, 3, 6, NOW()),
(35.00, 105.00, 1, 3, 3, 8, NOW()),
(45.00, 225.00, 1, 5, 4, 5, NOW()),
(60.00, 120.00, 1, 2, 5, 7, NOW()),
(22.00, 110.00, 1, 5, 6, 9, NOW());

-- ============================================================
-- 11. DATOS DEL MÓDULO OFERTAS
-- ============================================================

INSERT INTO ofertas (of_nombre, descripcion, porcentaje, fecha_inc, fecha_fin, estado, created_at) VALUES
('Promocion Verano 2026', 'Descuento en baterias', 15.00, '2026-01-01', '2026-02-28', 1, NOW()),
('Oferta SSD', 'Descuento especial en discos solidos', 10.00, '2026-01-15', '2026-03-15', 1, NOW()),
('Black Friday TI', 'Descuentos en todo', 20.00, '2026-01-20', '2026-02-28', 1, NOW()),
('Liquidación Anual', 'Últimos modelos', 25.00, '2026-01-25', '2026-03-31', 1, NOW());

-- ============================================================
-- 12. DATOS DEL MÓDULO VENTAS
-- ============================================================

INSERT INTO ventas (id_cliente, id_usuario, metodo_pago, fecha, observacion, total, estado, created_at) VALUES
(1, 5, 'Efectivo', '2026-01-10', 'Venta de SSD', 85.00, 1, NOW()),
(2, 5, 'Transferencia', '2026-01-12', 'Venta de batería', 120.00, 1, NOW()),
(3, 5, 'Tarjeta', '2026-01-15', 'Venta multiple', 185.00, 1, NOW()),
(4, 5, 'Efectivo', '2026-01-18', 'Venta de RAM', 65.00, 1, NOW()),
(5, 5, 'Transferencia', '2026-01-20', 'Venta de cargadores', 110.00, 1, NOW()),
(6, 5, 'Efectivo', '2026-01-22', 'Venta de ventilador', 35.00, 1, NOW());

INSERT INTO detalle_venta (id_venta, id_repuesto, descuento, subtotal, cantidad, precio_unitario, created_at) VALUES
(1, 4, 0.00, 85.00, 1, 85.00, NOW()),
(2, 1, 0.00, 120.00, 1, 120.00, NOW()),
(3, 1, 0.00, 120.00, 1, 120.00, NOW()),
(3, 6, 0.00, 65.00, 1, 65.00, NOW()),
(4, 6, 0.00, 65.00, 1, 65.00, NOW()),
(5, 8, 0.00, 55.00, 2, 55.00, NOW()),
(6, 9, 0.00, 35.00, 1, 35.00, NOW());

-- ============================================================
-- 13. DATOS DEL MÓDULO COTIZACIONES
-- ============================================================

INSERT INTO cotizaciones (id_orden, id_oferta, id_cliente, id_usuario, fecha_cad, monto_total, descuento, created_at) VALUES
(1, 1, 1, 1, '2026-01-20', 150.00, 22.50, NOW()),
(2, NULL, 2, 2, '2026-01-25', 200.00, 0.00, NOW()),
(3, 2, 3, 3, '2026-01-28', 100.00, 10.00, NOW()),
(4, NULL, 4, 4, '2026-02-01', 120.00, 0.00, NOW()),
(5, 3, 5, 5, '2026-02-05', 180.00, 36.00, NOW()),
(6, NULL, 6, 1, '2026-02-08', 90.00, 0.00, NOW());

INSERT INTO detalle_cotizaciones (id_cotizacion, id_equipo, id_repuesto, precio, cantidad, descuento, created_at) VALUES
(1, 1, NULL, 150.00, 1, 0.00, NOW()),
(2, 2, NULL, 200.00, 1, 0.00, NOW()),
(3, 3, 1, 100.00, 1, 0.00, NOW()),
(4, 4, NULL, 120.00, 1, 0.00, NOW()),
(5, 5, NULL, 180.00, 1, 0.00, NOW()),
(6, 6, 9, 90.00, 1, 0.00, NOW());

-- ============================================================
-- 14. DATOS DEL MÓDULO HERRAMIENTAS
-- ============================================================

INSERT INTO categorias_herramientas (nombre, requiere_certificacion, estado, created_at) VALUES
('Herramientas Electronicas', 1, 1, NOW()),
('Herramientas Manuales', 0, 1, NOW()),
('Instrumentos de Medición', 1, 1, NOW()),
('Herramientas Especializadas', 1, 1, NOW());

INSERT INTO herramientas (id_categoria_herramienta, nombre, nro_serie_interno, estado_fisico, estado, created_at) VALUES
(1, 'Multimetro Digital', 'H-001', 'excelente', 1, NOW()),
(1, 'Osciloscopio', 'H-002', 'bueno', 1, NOW()),
(2, 'Destornillador Precision', 'H-003', 'excelente', 1, NOW()),
(2, 'Pinza Electrónica', 'H-004', 'bueno', 1, NOW()),
(3, 'Calibrador Digital', 'H-005', 'regular', 1, NOW()),
(4, 'Estación de Soldadura', 'H-006', 'bueno', 1, NOW());

-- ============================================================
-- 15. DATOS DEL MÓDULO MANTENIMIENTO
-- ============================================================

INSERT INTO mantenimientos (nombre, descripcion, tarifa_base, tiempo_estimado, estado, created_at) VALUES
('Limpieza Interna', 'Limpieza completa de componentes', 80.00, 60, 1, NOW()),
('Cambio de Batería', 'Reemplazo de batería', 100.00, 45, 1, NOW()),
('Reparacion de Pantalla', 'Cambio de display', 150.00, 90, 1, NOW()),
('Actualizacion de Firmware', 'Actualizacion de BIOS/firmware', 60.00, 30, 1, NOW()),
('Diagnostico General', 'Revisión completa del sistema', 50.00, 120, 1, NOW()),
('Cambio de Ventilador', 'Reemplazo de ventilador de CPU', 70.00, 50, 1, NOW());

-- ============================================================
-- 16. DATOS DEL MÓDULO TRABAJOS DE MANTENIMIENTO
-- ============================================================

INSERT INTO trabajos_mantenimiento (id_diagnostico, id_mantenimiento, fecha_programada, fecha_inicio, fecha_fin, observaciones, estado, created_at) VALUES
(1, 3, '2026-01-12', '2026-01-12 09:00:00', '2026-01-12 11:30:00', 'Trabajo completo exitosamente', 'finalizado', NOW()),
(2, 2, '2026-01-14', NULL, NULL, 'Esperando llegada de repuesto', 'pendiente', NOW()),
(3, 1, '2026-01-17', '2026-01-17 10:00:00', NULL, 'En proceso de limpieza', 'en_proceso', NOW()),
(4, 5, '2026-01-20', NULL, NULL, 'Pendiente de programacion', 'pendiente', NOW()),
(5, 3, '2026-01-22', NULL, NULL, 'Esperando aprobacion del cliente', 'pendiente', NOW()),
(6, 6, '2026-01-25', NULL, NULL, 'Pendiente de programacion', 'pendiente', NOW());

-- ============================================================
-- 17. DATOS DEL MÓDULO ASIGNACIONES
-- ============================================================

INSERT INTO asignaciones (id_trabajo_mantenimiento, id_personal, rol_asignacion, horas_invertidas, fecha_asignacion, estado, created_at) VALUES
(1, 1, 'Tecnico Principal', 2.50, '2026-01-12 08:30:00', 1, NOW()),
(1, 2, 'Tecnico Asistente', 2.00, '2026-01-12 08:30:00', 1, NOW()),
(2, 2, 'Tecnico Principal', 0.00, '2026-01-14 09:00:00', 1, NOW()),
(3, 1, 'Tecnico Principal', 1.50, '2026-01-17 09:30:00', 1, NOW()),
(4, 3, 'Supervisor', 0.00, '2026-01-20 08:00:00', 1, NOW()),
(5, 2, 'Tecnico Principal', 0.00, '2026-01-22 08:00:00', 1, NOW()),
(6, 6, 'Tecnico Principal', 0.00, '2026-01-25 08:00:00', 1, NOW());

-- ============================================================
-- 18. DATOS DEL MÓDULO TRABAJO_HERRAMIENTAS
-- ============================================================

INSERT INTO trabajo_herramientas (id_trabajo_mantenimiento, id_herramienta, observacion, estado, created_at) VALUES
(1, 1, 'Multimetro usado para verificacion', 1, NOW()),
(1, 3, 'Destornillador para apertura', 1, NOW()),
(3, 1, 'Verificacion de continuidad', 1, NOW()),
(3, 4, 'Pinza para manejo de cables', 1, NOW()),
(5, 6, 'Estacion de soldadura preparada', 1, NOW()),
(6, 2, 'Osciloscopio para diagnostico', 1, NOW());

-- ============================================================
-- 19. DATOS DEL MÓDULO TRABAJO_REPUESTOS
-- ============================================================

INSERT INTO trabajo_repuestos (id_trabajo_mantenimiento, id_repuesto, cantidad, observacion, estado, created_at) VALUES
(1, 3, 1, 'Pantalla reemplazada', 1, NOW()),
(2, 1, 1, 'Bateria nueva instalada', 1, NOW()),
(5, 4, 1, 'SSD para reemplazo de disco dañado', 1, NOW()),
(6, 9, 1, 'Ventilador nuevo instalado', 1, NOW());

-- ============================================================
-- 20. DATOS DEL MÓDULO INVENTARIO (NUEVA ESTRUCTURA)
-- ============================================================

INSERT INTO inventario (id_repuesto, fecha_registro, stock_minimo, stock_maximo, ubicacion, observacion, id_usuario_creacion, estado, created_at) VALUES
(1, '2026-01-01', 5, 30, 'Estante A-01', 'Baterias HP Pavilion', 1, 1, NOW()),
(2, '2026-01-01', 3, 20, 'Estante A-02', 'Baterias Dell Latitude', 1, 1, NOW()),
(3, '2026-01-01', 2, 15, 'Estante B-01', 'Pantallas 15.6"', 1, 1, NOW()),
(4, '2026-01-01', 10, 50, 'Estante C-01', 'SSD 500GB', 1, 1, NOW()),
(5, '2026-01-01', 5, 25, 'Estante C-02', 'HDD 1TB', 1, 1, NOW()),
(6, '2026-01-01', 8, 30, 'Estante D-01', 'RAM 8GB DDR4', 1, 1, NOW()),
(7, '2026-01-01', 2, 10, 'Estante E-01', 'Teclados MacBook', 1, 1, NOW()),
(8, '2026-01-01', 5, 30, 'Estante F-01', 'Cargadores HP 65W', 1, 1, NOW()),
(9, '2026-01-01', 3, 15, 'Estante G-01', 'Ventiladores HP', 1, 1, NOW());

-- ============================================================
-- 21. DATOS DEL MÓDULO LOTE_STOCK (NUEVA ESTRUCTURA)
-- ============================================================

INSERT INTO lote_stock (codigo_lote, id_detalle_compra, fecha_ingreso, cantidad_inicial, cantidad_disponible, costo_unitario, fecha_vencimiento, estado, observacion, created_at) VALUES
('LOTE-001-2026', 1, '2026-01-05', 2, 2, 80.00, '2027-12-31', 'ACTIVO', 'Lote de baterias HP', NOW()),
('LOTE-002-2026', 2, '2026-01-05', 4, 3, 55.00, '2028-12-31', 'ACTIVO', 'Lote de SSD', NOW()),
('LOTE-003-2026', 3, '2026-01-08', 2, 1, 120.00, '2027-12-31', 'ACTIVO', 'Lote de pantallas', NOW()),
('LOTE-004-2026', 4, '2026-01-12', 2, 0, 40.00, '2027-12-31', 'AGOTADO', 'Lote de RAM', NOW()),
('LOTE-005-2026', 5, '2026-01-12', 3, 1, 35.00, '2027-12-31', 'ACTIVO', 'Lote de cargadores', NOW()),
('LOTE-006-2026', 6, '2026-01-15', 5, 5, 45.00, '2028-12-31', 'ACTIVO', 'Lote de HDD', NOW()),
('LOTE-007-2026', 7, '2026-01-18', 2, 2, 60.00, '2027-12-31', 'ACTIVO', 'Lote de teclados Apple', NOW()),
('LOTE-008-2026', 8, '2026-01-20', 5, 4, 22.00, '2027-12-31', 'ACTIVO', 'Lote de ventiladores', NOW());

-- ============================================================
-- 22. DATOS DEL MÓDULO KARDEX (NUEVA ESTRUCTURA)
-- ============================================================

INSERT INTO kardex (
    id_inventario, 
    id_lote_stock, 
    id_detalle_compra, 
    id_detalle_venta, 
    id_trabajo_repuesto, 
    id_usuario, 
    tipo_movimiento, 
    cantidad_entrada, 
    cantidad_salida, 
    saldo_anterior, 
    saldo_actual, 
    concepto, 
    referencia, 
    observacion, 
    fecha_movimiento
) VALUES
-- Entradas por compras
(1, 1, 1, NULL, NULL, 1, 'ENTRADA', 2, 0, 0, 2, 'Compra inicial baterias HP', 'COMP-001', 'LOTE-001', '2026-01-05 10:00:00'),
(4, 2, 2, NULL, NULL, 1, 'ENTRADA', 4, 0, 0, 4, 'Compra inicial SSD', 'COMP-001', 'LOTE-002', '2026-01-05 10:00:00'),
(3, 3, 3, NULL, NULL, 2, 'ENTRADA', 2, 0, 0, 2, 'Compra inicial pantallas', 'COMP-002', 'LOTE-003', '2026-01-08 14:00:00'),
(6, 4, 4, NULL, NULL, 3, 'ENTRADA', 2, 0, 0, 2, 'Compra inicial RAM', 'COMP-003', 'LOTE-004', '2026-01-12 09:00:00'),
(8, 5, 5, NULL, NULL, 3, 'ENTRADA', 3, 0, 0, 3, 'Compra inicial cargadores', 'COMP-003', 'LOTE-005', '2026-01-12 09:00:00'),
(5, 6, 6, NULL, NULL, 1, 'ENTRADA', 5, 0, 0, 5, 'Compra inicial HDD', 'COMP-004', 'LOTE-006', '2026-01-15 11:00:00'),
(7, 7, 7, NULL, NULL, 2, 'ENTRADA', 2, 0, 0, 2, 'Compra inicial teclados Apple', 'COMP-005', 'LOTE-007', '2026-01-18 10:00:00'),
(9, 8, 8, NULL, NULL, 6, 'ENTRADA', 5, 0, 0, 5, 'Compra inicial ventiladores', 'COMP-006', 'LOTE-008', '2026-01-20 10:00:00'),

-- Salidas por ventas
(4, 2, NULL, 1, NULL, 5, 'SALIDA', 0, 1, 4, 3, 'Venta SSD a cliente', 'VENTA-001', 'Cliente Empresa ABC', '2026-01-10 14:30:00'),
(1, 1, NULL, 2, NULL, 5, 'SALIDA', 0, 1, 2, 1, 'Venta baterias HP', 'VENTA-002', 'Cliente Maria Lopez', '2026-01-12 15:00:00'),
(1, 1, NULL, 3, NULL, 5, 'SALIDA', 0, 1, 1, 0, 'Venta baterias HP', 'VENTA-003', 'Cliente Tecnologia XYZ', '2026-01-15 16:00:00'),
(6, 4, NULL, 3, NULL, 5, 'SALIDA', 0, 1, 2, 1, 'Venta RAM', 'VENTA-003', 'Cliente Tecnologia XYZ', '2026-01-15 16:00:00'),
(6, 4, NULL, 4, NULL, 5, 'SALIDA', 0, 1, 1, 0, 'Venta RAM', 'VENTA-004', 'Cliente Pedro Ramirez', '2026-01-18 10:00:00'),
(8, 5, NULL, 5, NULL, 5, 'SALIDA', 0, 2, 3, 1, 'Venta cargadores', 'VENTA-005', 'Cliente Consultora Sistemas', '2026-01-20 11:00:00'),
(9, 8, NULL, 6, NULL, 5, 'SALIDA', 0, 1, 5, 4, 'Venta ventilador', 'VENTA-006', 'Cliente Juan Mendoza', '2026-01-22 11:00:00'),

-- Salidas por mantenimiento
(3, 3, NULL, NULL, 1, 2, 'SALIDA', 0, 1, 2, 1, 'Cambio de pantalla', 'TRAB-001', 'Trabajo mantenimiento #1', '2026-01-12 11:30:00'),
(4, 2, NULL, NULL, 3, 2, 'SALIDA', 0, 1, 3, 2, 'Cambio de SSD por mantenimiento', 'TRAB-005', 'Trabajo mantenimiento #5', '2026-01-22 10:00:00'),
(9, 8, NULL, NULL, 4, 6, 'SALIDA', 0, 1, 4, 3, 'Cambio de ventilador', 'TRAB-006', 'Trabajo mantenimiento #6', '2026-01-25 08:00:00');

-- ============================================================
-- 23. DATOS DEL MÓDULO INVENTARIO_FISICO (NUEVA ESTRUCTURA)
-- ============================================================

INSERT INTO inventario_fisico (
    id_inventario, 
    id_usuario, 
    fecha_conteo, 
    stock_sistema, 
    stock_contado, 
    diferencia, 
    resultado, 
    observacion, 
    created_at
) VALUES
(1, 1, '2026-01-15 09:00:00', 15, 15, 0, 'CONFORME', 'Coincide con sistema', NOW()),
(2, 1, '2026-01-15 09:30:00', 10, 9, -1, 'FALTANTE', 'Una unidad no encontrada', NOW()),
(3, 1, '2026-01-15 10:00:00', 8, 8, 0, 'CONFORME', 'Coincide con sistema', NOW()),
(4, 1, '2026-01-15 10:30:00', 25, 24, -1, 'FALTANTE', 'Una unidad no localizada', NOW()),
(5, 1, '2026-01-15 11:00:00', 12, 12, 0, 'CONFORME', 'Coincide con sistema', NOW()),
(6, 1, '2026-01-15 11:30:00', 20, 20, 0, 'CONFORME', 'Coincide con sistema', NOW()),
(7, 1, '2026-01-15 12:00:00', 5, 5, 0, 'CONFORME', 'Coincide con sistema', NOW()),
(8, 1, '2026-01-15 12:30:00', 18, 17, -1, 'FALTANTE', 'Una unidad no encontrada', NOW()),
(9, 1, '2026-01-20 09:00:00', 10, 10, 0, 'CONFORME', 'Coincide con sistema', NOW());

-- ============================================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================================

SELECT 'Personal' as Tabla, COUNT(*) as Registros FROM personal
UNION ALL
SELECT 'Marcas Equipo', COUNT(*) FROM marcas_equipo
UNION ALL
SELECT 'Modelos', COUNT(*) FROM modelos
UNION ALL
SELECT 'Equipos', COUNT(*) FROM equipos
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Ordenes Servicio', COUNT(*) FROM orden_servicio
UNION ALL
SELECT 'Diagnósticos', COUNT(*) FROM diagnosticos
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Rol Usuario', COUNT(*) FROM rol_usuario
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL
SELECT 'Repuestos', COUNT(*) FROM repuestos
UNION ALL
SELECT 'Ventas', COUNT(*) FROM ventas
UNION ALL
SELECT 'Detalle Venta', COUNT(*) FROM detalle_venta
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM proveedores
UNION ALL
SELECT 'Compras', COUNT(*) FROM compras
UNION ALL
SELECT 'Detalle Compras', COUNT(*) FROM detalle_compras
UNION ALL
SELECT 'Ofertas', COUNT(*) FROM ofertas
UNION ALL
SELECT 'Cotizaciones', COUNT(*) FROM cotizaciones
UNION ALL
SELECT 'Detalle Cotizaciones', COUNT(*) FROM detalle_cotizaciones
UNION ALL
SELECT 'Categorías Herramientas', COUNT(*) FROM categorias_herramientas
UNION ALL
SELECT 'Herramientas', COUNT(*) FROM herramientas
UNION ALL
SELECT 'Mantenimientos', COUNT(*) FROM mantenimientos
UNION ALL
SELECT 'Trabajos Mantenimiento', COUNT(*) FROM trabajos_mantenimiento
UNION ALL
SELECT 'Asignaciones', COUNT(*) FROM asignaciones
UNION ALL
SELECT 'Trabajo Herramientas', COUNT(*) FROM trabajo_herramientas
UNION ALL
SELECT 'Trabajo Repuestos', COUNT(*) FROM trabajo_repuestos
UNION ALL
SELECT 'Inventario', COUNT(*) FROM inventario
UNION ALL
SELECT 'Lote Stock', COUNT(*) FROM lote_stock
UNION ALL
SELECT 'Kardex', COUNT(*) FROM kardex
UNION ALL
SELECT 'Inventario Fisico', COUNT(*) FROM inventario_fisico;