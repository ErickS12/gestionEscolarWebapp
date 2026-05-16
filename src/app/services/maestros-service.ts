import { Injectable } from '@angular/core';
import { ErrorsService } from './tools/errors-service';
import { ValidatorService } from './tools/validator-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthServices } from './auth-services';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MaestrosService {


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

  public esquemaMaestro(){
    return {
      'rol':'',
      'id_trabajador': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'fecha_nacimiento': '',
      'telefono': '',
      'rfc': '',
      'cubiculo': '',
      'area_investigacion': '',
      'materias_json': []
    }

  }

  //Validación para el formulario
  public validarMaestro(data: any, editar: boolean){
    let error: any = {};

    if(!this.validatorService.required(data["id_trabajador"])){
      error["id_trabajador"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["first_name"])){
      error["first_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["last_name"])){
      error["last_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["email"])){
      error["email"] = this.errorService.required;
    }else if(!this.validatorService.maxLen(data["email"], 40)){
      error["email"] = this.errorService.max;
    }else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    if(!editar){
      if(!this.validatorService.required(data["password"])){
        error["password"] = this.errorService.required;
      }

      if(!this.validatorService.required(data["confirmar_password"])){
        error["confirmar_password"] = this.errorService.required;
      }
    }

    if(!this.validatorService.required(data["fecha_nacimiento"])){
      error["fecha_nacimiento"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["rfc"])){
      error["rfc"] = this.errorService.required;
    }else if(!this.validatorService.minLen(data["rfc"], 12)){
      error["rfc"] = this.errorService.min;
    }else if(!this.validatorService.maxLen(data["rfc"], 13)){
      error["rfc"] = this.errorService.max;
    }

    if(!this.validatorService.required(data["telefono"])){
      error["telefono"] = this.errorService.required;
    } else if (!this.validatorService.phoneMX(data["telefono"])) {
      error["telefono"] = 'Teléfono inválido. Debe contener 10 dígitos.';
    }

    if(!this.validatorService.required(data["cubiculo"])){
      error["cubiculo"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["area_investigacion"])){
      error["area_investigacion"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["materias_json"])){
      error["materias_json"] = "Debes seleccionar materias para poder registrarte";
    }

    if(!this.validatorService.required(data["fecha_nacimiento"])){
      error["fecha_nacimiento"] = this.errorService.required;
    } else if (!this.validatorService.dateISO(data["fecha_nacimiento"])) {
      error["fecha_nacimiento"] = this.errorService.betweenDate;
    }

    return error;
  }


  //Creamos la petición POST para registrar al maestro, esta función se llamará en el método registrar() del componente registro-maestro.ts
  public registrarMaestro(data: any) {
      return this.http.post<any>(`${environment.url_api}/maestros/`, data, { headers: this.getAuthHeaders() });
    }
}