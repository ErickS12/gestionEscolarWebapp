import { Injectable } from '@angular/core';
import { ErrorsService } from './tools/errors-service';
import { ValidatorService } from './tools/validator-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthServices } from './auth-services';
import { environment } from '../../environments/environment';

/*En este script se define el servicio AlumnoService que se encarga de manejar las operaciones relacionadas con los alumnos, como registrar, obtener la lista de alumnos, obtener un alumno por su ID, actualizar y eliminar un alumno. El servicio utiliza HttpClient para realizar las peticiones HTTP al backend y también incluye métodos para validar los datos del alumno antes de enviarlos al servidor. Además, se generan los HttpHeaders con el token de sesión si existe para asegurar que las peticiones estén autenticadas. 
*/


@Injectable({
  providedIn: 'root',
})
export class AlumnoService {
  /** Genera los HttpHeaders con el token de sesión si existe */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authServices.getSessionToken();
    return token
      ? new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  constructor(
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private http: HttpClient, // para manejar las peticiones http
    private authServices: AuthServices,
  ) {}

  public esquemaAlumno() {
    return {
      'rol': '',
      'id_alumno': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'fecha_nacimiento': '',
      'telefono': '',
      'curp': '',
      'carrera': '',
      'direccion': '',
      'sexo': '',
      'materias_json': []
    };
  }

  // Validación para el formulario
  public validarAlumno(data: any, editar: boolean) {
    let error: any = {};

    if (!this.validatorService.required(data['id_alumno'])) {
      error['id_alumno'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['first_name'])) {
      error['first_name'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['last_name'])) {
      error['last_name'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['email'])) {
      error['email'] = this.errorService.required;
    } else if (!this.validatorService.maxLen(data['email'], 40)) {
      error['email'] = this.errorService.max;
    } else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    if (!editar) {
      if (!this.validatorService.required(data['password'])) {
        error['password'] = this.errorService.required;
      }

      if (!this.validatorService.required(data['confirmar_password'])) {
        error['confirmar_password'] = this.errorService.required;
      }
    }

    if (!this.validatorService.required(data['fecha_nacimiento'])) {
      error['fecha_nacimiento'] = this.errorService.required;
    } else if (!this.validatorService.dateISO(data['fecha_nacimiento'])) {
      error['fecha_nacimiento'] = this.errorService.betweenDate;
    }

    if (!this.validatorService.required(data['telefono'])) {
      error['telefono'] = this.errorService.required;
    } else if (!this.validatorService.phoneMX(data['telefono'])) {
      error['telefono'] = 'Teléfono inválido. Debe contener 10 dígitos.';
    }

    if (!this.validatorService.required(data['curp'])) {
      error['curp'] = this.errorService.required;
    } else if (!this.validatorService.minLen(data['curp'], 18)) {
      error['curp'] = this.errorService.min;
    } else if (!this.validatorService.maxLen(data['curp'], 18)) {
      error['curp'] = this.errorService.max;
    }

    if (!this.validatorService.required(data['carrera'])) {
      error['carrera'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['direccion'])) {
      error['direccion'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['sexo'])) {
      error['sexo'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['materias_json'])) {
      error['materias_json'] = 'Debes seleccionar materias para poder registrarte';
    }

    return error;
  }

  /*
  La sintaxis de las funciones para manejar las operaciones relacionadas con los alumnos es la siguiente:

  public nombreFuncion(parametros: tipo): tipoRetorno {
    // lógica de la función
  }
    el data: any se refiere a un objeto que contiene los datos del alumno que se van a enviar al backend para registrar o actualizar un alumno. Este objeto puede tener propiedades como id_alumno, first_name, last_name, email, password, confirmar_password, fecha_nacimiento, telefono, curp, carrera y materias_json, dependiendo de la función que se esté utilizando (registrarAlumno o actualizarAlumno). El tipo any se utiliza para permitir que el objeto tenga cualquier estructura, pero en la práctica se espera que tenga las propiedades mencionadas para que el backend pueda procesar correctamente la información del alumno.
 
    El return this.http.post<any>(`${environment.url_api}/alumnos/`, data, { headers: this.getAuthHeaders() }) se refiere a la respuesta que se obtiene al hacer una petición HTTP POST al endpoint /alumnos/ del backend, enviando el objeto data con los datos del alumno a registrar y los headers de autenticación generados por la función getAuthHeaders(). El tipo any se utiliza para indicar que la respuesta puede tener cualquier estructura, pero en la práctica se espera que el backend devuelva un objeto con información sobre el alumno registrado o un mensaje de éxito o error.
    
    La estructura de `${environment.url_api}/alumnos/` se refiere a la URL del endpoint al que se hace la petición HTTP. La parte `${environment.url_api}` se refiere a una variable de entorno que contiene la URL base del backend, y `/alumnos/` es el endpoint específico para manejar las operaciones relacionadas con los alumnos. Al usar esta sintaxis, se puede cambiar fácilmente la URL base del backend sin tener que modificar cada función que hace una petición HTTP, lo que facilita el mantenimiento del código.

    El observable que se devuelve al hacer la petición HTTP se puede suscribir en el componente que llama a la función para manejar la respuesta del backend, ya sea mostrando un mensaje de éxito o error al usuario o actualizando la interfaz de usuario con la información del alumno registrado o actualizado.

    Un observable es una colección de valores o eventos futuros que pueden ser manejados de manera asíncrona. En el contexto de Angular, los observables se utilizan para manejar las respuestas de las peticiones HTTP, ya que estas operaciones son asíncronas y pueden tardar un tiempo en completarse. Al devolver un observable en las funciones del servicio, se permite que el componente que llama a la función se suscriba a ese observable para recibir la respuesta del backend cuando esté disponible, lo que mejora la experiencia del usuario al no bloquear la interfaz mientras se espera la respuesta.

    ?id=${id} se refiere a un parámetro de consulta que se agrega a la URL del endpoint para obtener un alumno específico por su ID. En este caso, se espera que el backend tenga una lógica para manejar esta consulta y devolver la información del alumno correspondiente al ID proporcionado. Al usar esta sintaxis, se puede obtener la información de un alumno específico sin tener que hacer una petición HTTP separada para cada alumno, lo que mejora la eficiencia del código y reduce la cantidad de peticiones al backend.
  */ 

  //Creamos la petición POST para registrar al alumno, esta función se llamará en el método registrar() del componente registro-alumno.ts
  public registrarAlumno(data: any) {
    return this.http.post<any>(`${environment.url_api}/alumnos/`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  //Funcion para obtener la lista de alumnos registrados, esta función se llamará en el método obtenerAlumnos() del componente alumnos-screen.ts
  public obtenerListaAlumnos() {
    return this.http.get<any>(`${environment.url_api}/lista-alumnos/`, {
      headers: this.getAuthHeaders(),
    });
  }

  //Funcion para obtener un alumno por su ID, esta función se llamará en el método obtenerUsuarioPorId() del componente registro-usuarios-screen.ts 
  public obtenerAlumnoPorId(id: number) {
    return this.http.get<any>(`${environment.url_api}/alumnos/?id=${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  //Creamos la petición PUT para actualizar los datos del alumno, esta función se llamará en el método actualizar() dentro del componente registro-alumno.ts
  public actualizarAlumno(data: any) {
    return this.http.put<any>(`${environment.url_api}/alumnos/`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  //Creamos la petición DELETE para eliminar un alumno, esta función se llamará en el método eliminarAlumno() dentro del modal eliminar-user-modal.ts
  public eliminarAlumno(id: number) {
    return this.http.delete<any>(`${environment.url_api}/alumnos/?id=${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
