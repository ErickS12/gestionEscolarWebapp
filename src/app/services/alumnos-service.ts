import { Injectable } from '@angular/core';
import { ErrorsService } from './tools/errors-service';
import { ValidatorService } from './tools/validator-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthServices } from './auth-services';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AlumnoService {


  /** Genera los HttpHeaders con el token de sesión si existe */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authServices.getSessionToken();
    return token
      ? new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  constructor(
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private http: HttpClient,  // para manejar las peticiones http 
    private authServices: AuthServices
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

    if (!this.validatorService.required(data['materias_json'])) {
      error['materias_json'] = 'Debes seleccionar materias para poder registrarte';
    }

    return error;
  }

  //Creamos la petición POST para registrar al alumno, esta función se llamará en el método registrar() del componente registro-alumno.ts
  public registrarAlumno(data: any) {
    return this.http.post<any>(`${environment.url_api}/alumnos/`, data, { headers: this.getAuthHeaders() });
  }

}
