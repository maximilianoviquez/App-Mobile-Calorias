class Usuario {
    constructor() {
        this.id = null;
        this.usuario = null;
        this.password = null;
        this.idPais = null;
        this.caloriasDiarias = null;
        this.apiKey = null;
        
    }
    static parse(data) {
        let instancia = new Usuario();

        if (data.id) {
            instancia.id = data.id;
        }
        if (data.usuario) {
            instancia.usuario = data.usuario;
        }
        if (data.password) {
            instancia.password = data.password;
        }
        if (data.idPais) {
            instancia.idPais = data.idPais;
        }
        if (data.caloriasDiarias) {
            instancia.caloriasDiarias = data.caloriasDiarias;
        }
        if (data.apiKey) {
            instancia.apiKey = data.apiKey;
        }

        return instancia;
    }
}
class RegistroComida {
    constructor(calorias) { // Agrega calorias como parámetro del constructor
        this.id = null;
        this.idAlimento = null;
        this.idUsuario = null;
        this.cantidad = null;
        this.fecha = null;
        this.calorias = calorias; // Asigna el valor del parámetro calorias a la propiedad calorias
    }
    static parse(data) {
        let instancia = new RegistroComida(data.calorias); // Pasa data.calorias como parámetro al crear una nueva instancia

        if (data._id) {
            instancia.id = data._id;
        }
        if (data.idAlimento) {
            instancia.alimento = Alimento.parse(data.alimento);
        }
        if (data.idUsuario) {
            instancia.idUsuario = data.idUsuario;
        }
        if (data.cantidad) {
            instancia.cantidad = data.cantidad;
        }
        if (data.fecha) {
            instancia.fecha = data.fecha;
        }
        if (data.calorias) {
            instancia.calorias = data.calorias;
        }
        return instancia;
    }
}

// La función parse de la clase Alimento se utiliza para crear instancias de Alimento a partir de los datos obtenidos del servidor
class Alimento {
    constructor(id, urlImagen, nombre, calorias, porcion) {
        this.id = id;
        this.urlImagen = urlImagen;
        this.nombre = nombre;
        this.calorias = calorias;
        this.porcion = porcion;
    }

    static parse(data) {
        return new Alimento(data.id, data.urlImagen, data.nombre, data.calorias, data.porcion);
    }

    obtenerURLImagen() {
        return "https://calcount.develotion.com/imgs/" + this.id + ".png";
    }
}

class Pais {
    constructor() {
        this.id = null;
        this.name = null;
        this.currency = null;
        this.latitude = null;
        this.longitude = null;
    }
    static parse(data) {
        let instancia = new Pais();

        if (data._id) {
            instancia.id = data._id;
        }
        if (data.name) {
            instancia.name = data.name;
        }
        if (data.currency) {
            instancia.currency = data.currency;
        }
        if (data.latitude) {
            instancia.latitude = data.latitude;
        }
        if (data.longitude) {
            instancia.pais = data.longitude;
        }
        return instancia;
    }
}
