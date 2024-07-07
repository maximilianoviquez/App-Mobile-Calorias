// -------------------- VARIABLES Y CONSTANTES  --------------------------------------------------------------------------------------------------------------------------
const APIbaseURL = 'https://calcount.develotion.com/';
let usuarioLogueado = null;
let registrosComida = [];
let alimentos = [];
let paises = [];
let registrosUsuario = [];
let map = null;
let markerUsuario = null;
let markerPais = null;
let mapInitialized = false;



//Asumo que el usuario esta en ort, luego si la encuentro actualizo su ubicacion 
let posicionUsuario = {
    latitude: -34.903816878014354,
    longitude: -56.190590481081193
};

let posicionUsuarioIcon = L.icon({
    iconUrl: 'img/usuario.png',
    iconSize: [25, 25],
});

let posicionPaisIcon = L.icon({
    iconUrl: 'img/pais.png',
    iconSize: [25, 25],
});

const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const NAV = document.querySelector("#nav");
const PANTALLA_HOME = document.querySelector("#pantalla-home");
const PANTALLA_LOGIN = document.querySelector("#pantalla-login");
const PANTALLA_REGISTRO = document.querySelector("#pantalla-registro");
const PANTALLA_REGISTROSCOMIDA = document.querySelector("#pantalla-registrosComida");
const PANTALLA_LISTADO_REGISTROS_COMIDA = document.querySelector("#pantalla-listadoRegistrosComida");
const PANTALLA_INFORME_CALORIAS = document.querySelector("#pantalla-informeCalorias");
const PANTALLA_MAPA = document.querySelector("#pantalla-mapa");

// ----------------------- INICIALIZACION --------------------------------------------------------------------------------------------------------------------------
inicializar();

function inicializar() {
    suscribirmeAEventos();
    cargarPosicionUsuario();
    obtenerPaises(); // Llamar a la función para obtener la lista de países
    inicializarMapa(); 

}


// ----------------------- MAPA --------------------------------------------------------------------------------------------------------------------------
// Función para obtener la lista de países desde la API
function obtenerPaises() {
    const url = `${APIbaseURL}/paises.php`;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener la lista de países');
        }
        return response.json();
    })
    .then(data => {
        paises = data.paises;
        // Si el mapa ya está inicializado, llamamos a la función para marcar los países
        if (mapInitialized) {
            marcarPaises();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    if (!mapInitialized) {
        inicializarMapa();
        cargarPosicionUsuario();
        mapInitialized = true;
    }
});

    
    // Función para marcar los países en el mapa
    function marcarPaises() {
        paises.forEach(pais => {
            const latitud = parseFloat(pais.latitude);
            const longitud = parseFloat(pais.longitude);
            // Agregar marcador al mapa
            L.marker([latitud, longitud], { icon: posicionPaisIcon }).addTo(map).bindPopup(`País: ${pais.name}`);
        });
    }
    
    // Asociar la función de marcarPaises al botón correspondiente
    document.getElementById('btnMarcarPaises').addEventListener('click', marcarPaises);

function obtenerUsuariosPorPais(idPais, valorIngresado) {
    const url = `${APIbaseURL}/usuariosPorPais.php?idPais=${idPais}`;

    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "apikey": usuarioLogueado.apiKey, // Asegúrate de tener la clave de API del usuario logueado
            "iduser": usuarioLogueado.id
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener la cantidad de usuarios por país');
        }
        return response.json();
    })
    .then(data => {
        console.log('Respuesta del servidor:', data);
        const cantidadUsuarios = data.length;
        if (cantidadUsuarios > valorIngresado) {
            marcarPaisEnMapa(idPais);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}




// Función para marcar un país en el mapa
function marcarPaisEnMapa(idPais) {
    const pais = paises.find(p => p.id === idPais);
    if (pais) {
        const latitud = parseFloat(pais.latitude);
        const longitud = parseFloat(pais.longitude);
        // Agregar marcador al mapa
        L.marker([latitud, longitud], { icon: posicionPaisIcon }).addTo(map).bindPopup(`País: ${pais.name}`);
    }
}



function marcarPaisesChangeHandler(evt) {
    const valorIngresado = parseInt(document.querySelector("#txtValorPaises").value);
    if (isNaN(valorIngresado) || valorIngresado <= 0) {
        mostrarToast('ERROR', 'Error', 'Por favor, ingresa un valor numérico válido mayor que cero.');
        return;
    }

    let url = "https://calcount.develotion.com/usuariosPorPais.php";
    let apiKey = usuarioLogueado.apiKey;

    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "apikey": apiKey
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.status);
        }
        return response.json();
    })
    .then((data) => {
        console.log(data); // Agrega esta línea para depurar la respuesta del servidor
        // Verificar si data es un array antes de usar forEach
        if (Array.isArray(data)) {
            data.forEach((pais) => {
                const cantidadUsuarios = pais.cantidadUsuarios;
                if (cantidadUsuarios > valorIngresado) {
                    marcarPaisEnMapa(pais.id);
                }
            });
        } else {
            throw new Error('El servidor no devolvió la estructura esperada.');
        }
    })
    .catch((error) => {
        console.error('Error en la solicitud fetch:', error);
        mostrarToast('ERROR', 'Error', 'Error al obtener la cantidad de usuarios por país. Por favor, intente nuevamente.');
    });
}

// Inicializar el mapa sólo si no está ya inicializado
function inicializarMapa() {
    if (!map) {
        map = L.map('mapa').setView([posicionUsuario.latitude, posicionUsuario.longitude], 18);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        markerUsuario = L.marker([posicionUsuario.latitude, posicionUsuario.longitude], { icon: posicionUsuarioIcon }).addTo(map).bindPopup('Aquí está el usuario.');
    }
}

// Obtener la posición del usuario y actualizar el mapa
function cargarPosicionUsuario() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                if (pos && pos.coords && pos.coords.latitude) {
                    posicionUsuario = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    };
                    if (map) {
                        map.setView([posicionUsuario.latitude, posicionUsuario.longitude], 18);
                        markerUsuario.setLatLng([posicionUsuario.latitude, posicionUsuario.longitude]);
                    }
                }
            },
            function () {
                // No se hace nada, se asume que está en la ubicación predeterminada
            }
        );
    }
}

document.addEventListener('DOMContentLoaded', function () {
    inicializarMapa();
    cargarPosicionUsuario();
});


// ----------------------- SUSCRIBIRME A EVENTOS --------------------------------------------------------------------------------------------------------------------------
function suscribirmeAEventos() {
    // Login
    document.querySelector("#btnLoginIngresar").addEventListener("click", btnLoginIngresarHandler);
    // Registro
    document.querySelector("#btnRegistroRegistrarse").addEventListener("click", btnRegistroRegistrarseHandler);
    // Inicio
    document.querySelector("#btnRegistrosComida").addEventListener("click", btnRegistrosComidaHandler);
    // Ruteo
    ROUTER.addEventListener("ionRouteDidChange", navegar);

    document.querySelector("#selectAlimento").addEventListener("ionFocus", () => {
        obtenerAlimentos();
    });
    document.querySelector("#selectRegistroPais").addEventListener("ionFocus", () => {
        obtenerPaises();
    });

    document.querySelector("#btnFiltrarRegistros").addEventListener("click", () => {
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;
    if (!fechaInicio || !fechaFin) {
    mostrarToast('ERROR', 'Error', 'Debes ingresar ambas fechas para filtrar los registros.');
    return;
    }
    obtenerRegistrosComida(fechaInicio, fechaFin);
    });

    
    

}

function actualizarUsuarioLogueadoDesdeLocalStorage() {
    const usuarioGuardadoEnLocalStorage = localStorage.getItem("APPCalcountUsuarioLogueado");
    if (usuarioGuardadoEnLocalStorage) {
        usuarioLogueado = JSON.parse(usuarioGuardadoEnLocalStorage);
    } else {
        usuarioLogueado = null;
    }
}
function verificarInicio() {
    if (usuarioLogueado) {
        NAV.setRoot("page-registrosComida");
        NAV.popToRoot();
    } else {
        NAV.setRoot("page-login");
        NAV.popToRoot();
    }
}
// ----------------------- RUTEO --------------------------------------------------------------------------------------------------------------------------
function navegar(evt) {
    actualizarUsuarioLogueadoDesdeLocalStorage();
    actualizarMenu();
    ocultarPantallas();
    const pantallaDestino = evt.detail.to;
    switch(pantallaDestino) {
        case "/":
            verificarInicio();
            break;
        case "/login":
            mostrarLogin();
            break;
        case "/registro":
            mostrarRegistro();
            break;
        case "/registrosComida":
            mostrarRegistrosComida();
            break;
        case "/listadoRegistrosComida":
            obtenerRegistrosComida();
            mostrarListadoRegistrosComida();
            break;
        case "/informeCalorias":
            mostrarInformeCalorias();
            break;
        case "/mapa":
            mostrarMapa();
            break;
            
    }
}
// ----------------------- MENU --------------------------------------------------------------------------------------------------------------------------
function ocultarOpcionesMenu() {
    document.querySelector("#btnMenuLogin").style.display = "none";
    document.querySelector("#btnMenuRegistro").style.display = "none";
    document.querySelector("#btnMenuRegistrosComida").style.display = "none";
    document.querySelector("#btnMenuListadoRegistrosComida").style.display = "none";
    document.querySelector("#btnMenuInformeCalorias").style.display = "none";
    document.querySelector("#btnMenuMapa").style.display = "none";
    document.querySelector("#btnMenuCerrarSesion").style.display = "none";
}
function actualizarMenu() {
    ocultarOpcionesMenu();
    if (usuarioLogueado) {
        document.querySelector("#btnMenuRegistrosComida").style.display = "block";
        document.querySelector("#btnMenuListadoRegistrosComida").style.display = "block";
        document.querySelector("#btnMenuInformeCalorias").style.display = "block";
        document.querySelector("#btnMenuMapa").style.display = "block";
        document.querySelector("#btnMenuCerrarSesion").style.display = "block";
    } else {
        document.querySelector("#btnMenuLogin").style.display = "block";
        document.querySelector("#btnMenuRegistro").style.display = "block";
    }
}
// ----------------------- PANTALLAS --------------------------------------------------------------------------------------------------------------------------
function ocultarPantallas() {
    PANTALLA_HOME.style.display = "none";
    PANTALLA_LOGIN.style.display = "none";
    PANTALLA_REGISTRO.style.display = "none";
    PANTALLA_REGISTROSCOMIDA.style.display = "none";
    PANTALLA_LISTADO_REGISTROS_COMIDA.style.display = "none";
    PANTALLA_INFORME_CALORIAS.style.display = "none";
    PANTALLA_MAPA.style.display = "none";
}
function mostrarLogin() {
    PANTALLA_LOGIN.style.display = "block";
}
function mostrarRegistro() {
    PANTALLA_REGISTRO.style.display = "block";
}
function mostrarRegistrosComida() {

    PANTALLA_REGISTROSCOMIDA.style.display = "block";
}
function mostrarInformeCalorias(){
    PANTALLA_INFORME_CALORIAS.style.display = "block";
}
function mostrarMapa(){
    PANTALLA_MAPA.style.display = "block";
    inicializarMapa();
}

function cerrarMenu() {
    MENU.close();
}
// ----------------------- LOGOUT --------------------------------------------------------------------------------------------------------------------------
function cerrarSesion() {
    cerrarMenu();
    localStorage.clear();
    usuarioLogueado = null;
    NAV.setRoot("page-login");
    NAV.popToRoot();
}
// ----------------------- LOGIN --------------------------------------------------------------------------------------------------------------------------
function btnLoginIngresarHandler() {
    const usuarioIngresado = document.querySelector("#txtLoginUsuario").value;
    const passwordIngresado = document.querySelector("#txtLoginPassword").value;

    if (usuarioIngresado && passwordIngresado) {
        const url = APIbaseURL + 'login.php';
        const data = {
            "usuario": usuarioIngresado,
            "password": passwordIngresado
        };

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then((data) => {
            if (data.error) {
                mostrarToast('ERROR', 'Error', data.error);
            } else {
                localStorage.setItem("APPCalcountUsuarioLogueado", JSON.stringify(data));
                mostrarToast('SUCCESS', 'Ingreso exitoso', 'Se ha iniciado sesión.');
                usuarioLogueado = data;
                verificarInicio(); 
                vaciarCamposLogin();
            }
        })
        .catch((error) => {
            console.log(error);
            mostrarToast('ERROR', 'Error', 'Por favor, intente nuevamente.');
        });
    } else {
        mostrarToast('ERROR', 'Error', 'Todos los campos son obligatorios.');
    }
}
function vaciarCamposLogin() {
    document.querySelector("#txtLoginUsuario").value = "";
    document.querySelector("#txtLoginPassword").value = "";
}
// ----------------------- REGISTRO  --------------------------------------------------------------------------------------------------------------------------
function btnRegistroRegistrarseHandler() {
    const usuarioIngresado = document.querySelector("#txtRegistroUsuario").value;
    const passwordIngresado = document.querySelector("#txtRegistroPassword").value;
    const idPaisIngresado = document.querySelector("#selectRegistroPais").value;
    const caloriasDiariasIngresado = document.querySelector("#txtRegistroCaloriasDiarias").value;

    if (!validarRegistro(usuarioIngresado, passwordIngresado, idPaisIngresado, caloriasDiariasIngresado)) {
        return;
    }
    const url = APIbaseURL + '/usuarios.php';
    const data = {
        "usuario": usuarioIngresado,
        "password": passwordIngresado,
        "idPais": idPaisIngresado,
        "caloriasDiarias": caloriasDiariasIngresado,
        "caloriasPrevistas": caloriasDiariasIngresado // Utiliza el mismo valor para las calorías previstas y las calorías diarias
    };

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 409) {
            throw new Error('El nombre de usuario ya está en uso.');
        } else {
            throw new Error('Error en la solicitud');
        }
    })
    .then((data) => {
        if (data.error) {
            mostrarToast('ERROR', 'Error', data.error);
        } else {
            usuarioLogueado = {
                ...data,
                caloriasDiarias: caloriasDiariasIngresado,
                caloriasPrevistas: caloriasDiariasIngresado
            };
            localStorage.setItem("APPCalcountUsuarioRegistrado", JSON.stringify(data));
            mostrarToast('SUCCESS', 'Registro exitoso', 'Ya puede iniciar sesión.');
            vaciarCamposRegistro();
            NAV.setRoot("page-login");
            NAV.popToRoot();
        }
    })
    .catch((error) => {
        console.log(error);
        mostrarToast('ERROR', 'Error', error.message);
    });
}


function validarRegistro(usuario, password, idPais, caloriasDiarias) {
    // Validar que los campos no estén vacíos
    if (!usuario || !password || !idPais || !caloriasDiarias) {
        mostrarToast('ERROR', 'Error', 'Todos los campos son obligatorios.');
        return false;
    }
    // Validar longitud mínima del nombre de usuario
    if (usuario.length < 8) {
        mostrarToast('ERROR', 'Error', 'El nombre de usuario debe tener al menos 8 caracteres.');
        return false;
    }

    // Validar longitud mínima y complejidad de la contraseña
    const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
        mostrarToast('ERROR', 'Error', 'La contraseña debe tener al menos 8 caracteres, incluyendo al menos un número y una mayúscula.');
        return false;
    }

    // Validar que las calorías diarias ingresadas sean un número
    if (isNaN(parseFloat(caloriasDiarias))) {
        mostrarToast('ERROR', 'Error', 'El valor ingresado en el campo de calorías diarias no es un número válido.');
        return false;
    }

    // Validar que las calorías diarias sean mayores a 0
    if (parseFloat(caloriasDiarias) <= 0) {
        mostrarToast('ERROR', 'Error', 'Las calorías diarias deben ser mayores a 0.');
        return false;
    }

    const usuarioExiste = paises.some(pais => pais.usuario === usuario);
    if (usuarioExiste) {
        mostrarToast('ERROR', 'Error', 'El usuario ya está registrado.');
        return false;
    }

    return true;
}

// Función para vaciar los campos del formulario de registro
function vaciarCamposRegistro() {
    document.querySelector("#txtRegistroUsuario").value = "";
    document.querySelector("#txtRegistroPassword").value = "";
    document.querySelector("#selectRegistroPais").value = "";
    document.querySelector("#txtRegistroCaloriasDiarias").value = "";
}
// ----------------------- PAISES --------------------------------------------------------------------------------------------------------------------------
// Función para obtener la lista de países desde la API
function obtenerPaises() {
    const url = `${APIbaseURL}/paises.php`;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener la lista de países');
        }
        return response.json();
    })
    .then(data => {
        paises = data.paises;
        actualizarSelectPaises(document.querySelector("#selectRegistroPais"));
        if (mapInitialized) {
            marcarPaises();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Actualizar los select de países
function actualizarSelectPaises(selectElement) {
    selectElement.innerHTML = ""; 

    paises.forEach((pais) => {
        const option = document.createElement("ion-select-option");
        option.value = pais.id;
        option.textContent = pais.name;
        selectElement.appendChild(option);
    });
}



// --------------------- ALIMENTOS  --------------------------------------------------------------------------------------------------------------------------
function obtenerAlimentos() {
    const url = `${APIbaseURL}/alimentos.php`;
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "apikey": usuarioLogueado.apiKey,
            "iduser": usuarioLogueado.id
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        return response.json();
    })
    .then((data) => {
        if (data.alimentos && data.alimentos.length > 0) {
            alimentos = data.alimentos.map(alimentoData => Alimento.parse(alimentoData));
            actualizarSelectAlimentos();
            calcularCaloriasTotales();
        } else {
            mostrarToast('WARNING', 'Aviso', 'Aún no hay alimentos disponibles.');
        }
    })
    .catch((error) => {
        console.log(error);
        mostrarToast('ERROR', 'Error', 'Hubo un problema al obtener la lista de alimentos. Por favor, inténtalo nuevamente.');
    });
}



function obtenerAlimentoPorId(idAlimento) {
    return alimentos.find(alimento => alimento.id === idAlimento);
}

function actualizarSelectAlimentos() {
    const selectAlimento = document.querySelector("#selectAlimento");
    selectAlimento.innerHTML = "";
    
    alimentos.forEach((alimento) => {
        const option = document.createElement("ion-select-option");
        option.value = alimento.id;
        // Utiliza la función eliminarNumeros para obtener solo las letras de la porción
        const porcionSoloLetras = eliminarNumeros(alimento.porcion);
        option.textContent = alimento.nombre + " (" + porcionSoloLetras + ")";
        selectAlimento.appendChild(option);
    });
}
function eliminarNumeros(cadena) {
    // Utiliza una expresión regular para eliminar los números de la cadena
    return cadena.replace(/[0-9]/g, '');
}
// ----------------------- AGREGAR REGISTROS COMIDA  --------------------------------------------------------------------------------------------------------------------------
function btnRegistrosComidaHandler() {
    const idAlimento = document.querySelector("#selectAlimento").value;
    const cantidad = document.querySelector("#txtCantidad").value;
    const fecha = document.querySelector("#datetimeFecha").value;

    const fechaActual = new Date().setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fecha).setHours(0, 0, 0, 0);

    if (fechaSeleccionada < fechaActual - 24*60*60*1000 || fechaSeleccionada > fechaActual) {
        mostrarToast('ERROR', 'Error', 'La fecha seleccionada debe ser hoy o un día anterior.');
        return;
    }

    if (idAlimento) {
        agregarRegistroComida(idAlimento, cantidad, fecha);
    } else {
        mostrarToast('ERROR', 'Error', 'Debes seleccionar un alimento.');
    }
}


let totalCalorias = 0; // Declaración de la variable totalCalorias como global

function agregarRegistroComida(idAlimento, cantidad, fecha) {
    if (idAlimento && cantidad && fecha) {
        // Validar que la cantidad no sea 0
        if (parseFloat(cantidad) === 0) {
            mostrarToast('ERROR', 'Error', 'La cantidad no puede ser 0.');
            return;
        }

        if (usuarioLogueado) {
            const url = APIbaseURL + '/registros.php';

            const data = {
                "idAlimento": idAlimento,
                "idUsuario": usuarioLogueado.id,
                "cantidad": cantidad,
                "fecha": fecha
            };

            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": usuarioLogueado.apiKey,
                    "iduser": usuarioLogueado.id
                },
                body: JSON.stringify(data)
            })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error en la solicitud');
                }
            })
            .then((data) => {
                if (data.error) {
                    mostrarToast('ERROR', 'Error', data.error);
                } else {
                    // Obtener los datos del alimento seleccionado
                    const alimentoSeleccionado = alimentos.find(alimento => alimento.id === idAlimento);
                    if (alimentoSeleccionado) {
                        // Calcular las calorías del registro de comida
                        const caloriasRegistro = (alimentoSeleccionado.calorias * cantidad) / 100; // Ajustar las calorías según la cantidad y la porción del alimento
                        // Crear el nuevo registro de comida
                        const nuevoRegistro = {
                            idAlimento: idAlimento,
                            idUsuario: usuarioLogueado.id,
                            cantidad: cantidad,
                            fecha: fecha,
                            calorias: caloriasRegistro // Asignar las calorías calculadas al nuevo registro
                        };
                        registrosComida.push(nuevoRegistro);
                        totalCalorias += caloriasRegistro; // Actualizar la variable global de calorías totales
                        mostrarToast('SUCCESS', 'Registro exitoso', 'Se ha agregado el registro de comida correctamente.');
                    } else {
                        mostrarToast('ERROR', 'Error', 'El alimento seleccionado no se encontró en la base de datos.');
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                mostrarToast('ERROR', 'Error', 'Hubo un problema al agregar el registro de comida. Por favor, inténtalo nuevamente.');
            });
        } else {
            mostrarToast('ERROR', 'Error', 'Debes iniciar sesión para agregar un registro de comida.');
        }
    } else {
        mostrarToast('ERROR', 'Error', 'Todos los campos son obligatorios.');
    }
}



function obtenerNombresAlimentos() {
    registrosComida.forEach((registro) => {
        const alimento = alimentos.find(a => a.id === registro.idAlimento);
        if (alimento) {
            registro.nombreAlimento = alimento.nombre;
        } else {
            registro.nombreAlimento = "Alimento no encontrado"; // Manejar el caso cuando no se encuentra el alimento
        }
    });
    mostrarListadoRegistrosComida();
}


// ----------------- LISTAR REGISTROS DE COMIDA  --------------------------------------------------------------------------------------------------------------------------
function obtenerRegistrosComida(fechaInicio, fechaFin) {
    let url = `${APIbaseURL}/registros.php?idUsuario=${usuarioLogueado.id}`;

    // Agregar parámetros de fecha si están definidos
    if (fechaInicio && fechaFin) {
        url += `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }

    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "apikey": usuarioLogueado.apiKey,
            "iduser": usuarioLogueado.id
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        return response.json();
    })
    .then((data) => {
        console.log("Registros de comida recibidos:", data);
        if (data.registros && data.registros.length > 0) {
            registrosComida = data.registros.filter((registro) => {
                const fechaRegistro = new Date(registro.fecha);
                return fechaRegistro >= new Date(fechaInicio) && fechaRegistro <= new Date(fechaFin);
            });
            obtenerNombresAlimentos(); // Obtener nombres de alimentos y mostrar registros
        } else {
            mostrarToast('WARNING', 'Aviso', 'Aún no hay registros de comida en las fechas seleccionadas.');
        }
    })
    .catch((error) => {
        console.log(error);
        mostrarToast('ERROR', 'Error', 'Hubo un problema al obtener los registros de comida. Por favor, inténtalo nuevamente.');
    });
}


function obtenerNombresAlimentos() {
    registrosComida.forEach((registro) => {
        const alimento = alimentos.find(a => a.id === registro.idAlimento);
        if (alimento) {
            registro.nombreAlimento = alimento.nombre;
            registro.calorias = alimento.calorias;
            registro.urlImagen = alimento.obtenerURLImagen(); // Asignar URL de la imagen
        } else {
            registro.nombreAlimento = "Alimento no encontrado";
            registro.urlImagen = 'img/default.png'; // Imagen predeterminada si no se encuentra el alimento
        }
    });
    mostrarListadoRegistrosComida();
}


function mostrarListadoRegistrosComida() {
    const listaRegistrosComida = document.querySelector("#listaRegistrosComida");
    listaRegistrosComida.innerHTML = "";

    registrosComida.forEach((registro) => {
        const item = document.createElement("ion-item");

        const contenido = `
            <ion-card>
                <img src="${registro.urlImagen}" />
                <ion-card-header>
                    <ion-card-title>${registro.nombreAlimento}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ion-label>Cantidad: ${registro.cantidad}</ion-label>
                    <ion-label>Calorías: ${registro.calorias}</ion-label>
                    <ion-button color="danger" slot="end" onClick="eliminarRegistro('${registro.id}')">Eliminar</ion-button>
                </ion-card-content>
            </ion-card>
        `;

        item.innerHTML = contenido;
        listaRegistrosComida.appendChild(item);
    });

    PANTALLA_LISTADO_REGISTROS_COMIDA.style.display = "block";
}





function eliminarRegistro(idRegistro) {
    const confirmarEliminar = confirm("¿Estás seguro de que deseas eliminar este registro?");
    if (confirmarEliminar) {
        const url = `${APIbaseURL}/registros.php?idRegistro=${idRegistro}`;
        fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "apikey": usuarioLogueado.apiKey,
                "iduser": usuarioLogueado.id
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            // Remover el registro eliminado de la lista de registrosComida
            registrosComida = registrosComida.filter(registro => registro.id !== idRegistro);
            // Actualizar la lista de registros mostrada
            mostrarListadoRegistrosComida();
            mostrarToast('SUCCESS', 'Eliminación exitosa', 'Se ha eliminado el registro de comida correctamente.');
        })
        .catch((error) => {
            console.log(error);
            mostrarToast('ERROR', 'Error', 'Hubo un problema al eliminar el registro de comida. Por favor, inténtalo nuevamente.');
        });
    }
}

// ------------------INFORME DE CALORIAS  --------------------------------------------------------------------------------------------------------------------------

function calcularCaloriasTotales() {
    let totalCalorias = 0;
    registrosComida.forEach((registro) => {
        const alimento = obtenerAlimentoPorId(registro.idAlimento);
        if (alimento) {
            totalCalorias += (alimento.calorias * registro.cantidad) / 100;
        }
    });
    return totalCalorias;
}


// Función para calcular las calorías consumidas en el día actual
function calcularCaloriasDiaActual() {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);
    let caloriasTotalesDiaActual = 0;

    registrosComida.forEach(registro => {
        const fechaRegistro = new Date(registro.fecha);
        fechaRegistro.setHours(0, 0, 0, 0);

        if (fechaRegistro.getTime() === fechaActual.getTime()) {
            const alimento = obtenerAlimentoPorId(registro.idAlimento);
            if (alimento) {
                caloriasTotalesDiaActual += (alimento.calorias * registro.cantidad) / 100;
            }
        }
    });

    return caloriasTotalesDiaActual;
}



function mostrarInformeCalorias() {
    const caloriasDiaActual = calcularCaloriasDiaActual();
    const caloriasTotales = calcularCaloriasTotales();
    const caloriasTotalesElement = document.querySelector("#caloriasTotales");
    const caloriasDiaActualElement = document.querySelector("#caloriasDiarias");

    caloriasTotalesElement.textContent = `Calorías totales: ${caloriasTotales}`;
    caloriasDiaActualElement.textContent = `Calorías diarias: ${caloriasDiaActual}`;

    const caloriasDiariasPrevistas = usuarioLogueado.caloriasDiarias; // Obtener de usuarioLogueado
    if (caloriasDiaActual > caloriasDiariasPrevistas) {
        caloriasDiaActualElement.style.color = "red";
    } else if (caloriasDiaActual < caloriasDiariasPrevistas * 0.9) {
        caloriasDiaActualElement.style.color = "green";
    } else {
        caloriasDiaActualElement.style.color = "yellow";
    }

    PANTALLA_INFORME_CALORIAS.style.display = "block";
}

function actualizarRegistrosComida() {
    obtenerRegistrosComida(fechaInicio, fechaFin);
    const caloriasTotales = calcularCaloriasTotales();
    const caloriasDiaActual = calcularCaloriasDiaActual();
    mostrarInformeCalorias();
}


// ----------------------- FILTRAR REGISTROS --------------------------------------------------------------------------------------------------------------------------

function mostrarRegistrosFiltrados(registros) {
    const listaRegistrosComida = document.querySelector("#listaRegistrosComida");
    listaRegistrosComida.innerHTML = ""; // Limpiamos la lista antes de agregar los nuevos registros

    registros.forEach((registro) => {
        const item = document.createElement("ion-item");
        const contenido = `
            <ion-card>
                <img src="${registro.urlImagen}" />
                <ion-card-header>
                    <ion-card-title>${registro.nombreAlimento}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ion-label>Cantidad: ${registro.cantidad}</ion-label>
                    <ion-label>Calorías: ${registro.calorias}</ion-label>
                    <ion-button color="danger" slot="end" onClick="eliminarRegistro('${registro.id}')">Eliminar</ion-button>
                </ion-card-content>
            </ion-card>
        `;
        item.innerHTML = contenido;
        listaRegistrosComida.appendChild(item);
    });

    PANTALLA_LISTADO_REGISTROS_COMIDA.style.display = "block";
}


function filtrarRegistros() {
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    // Verificar que se hayan ingresado ambas fechas
    if (!fechaInicio || !fechaFin) {
        mostrarToast('ERROR', 'Error', 'Debes ingresar ambas fechas para filtrar los registros.');
        return;
    }

    // Llamar a la función obtenerRegistrosComida con las fechas como parámetros
    obtenerRegistrosComida(fechaInicio, fechaFin); // No es necesario pasar mostrarRegistrosFiltrados, se llamará internamente
}


function filtrarRegistrosPorFecha() {
    // Obtener fechas seleccionadas
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    // Llamar a la función para obtener registros con las fechas seleccionadas
    obtenerRegistrosComida(fechaInicio, fechaFin);
}

// ----------------------- MENSAJES --------------------------------------------------------------------------------------------------------------------------
async function mostrarToast(tipo, titulo, mensaje) {
    const toast = document.createElement('ion-toast');
    toast.header = titulo;
    toast.message = mensaje;
    toast.position = 'bottom';
    toast.duration = 2000;
    if (tipo === "ERROR") {
        toast.color = "danger";
    } else if (tipo === "SUCCESS") {
        toast.color = "success";
    } else if (tipo === "WARNING") {
        toast.color = "warning";
    }

    document.body.appendChild(toast);
    return toast.present();
}
