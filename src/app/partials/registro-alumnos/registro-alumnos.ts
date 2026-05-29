import { Component, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { AlumnoService } from '../../services/alumnos-service';
import { NotificationService } from '../../services/tools/notification-service';

@Component({
  selector: 'app-registro-alumnos',
  imports: [
    ...SHARED_IMPORTS,
    NgxMaskDirective
  ],
  templateUrl: './registro-alumnos.html',
  styleUrl: './registro-alumnos.scss',
})
export class RegistroAlumnos implements OnInit {
  @Input() rol:string = "";
  @Input() datos_user:any = {};

  public alumno:any={};
  public errors:any={};
  public inputType_1: string = 'password'; //inputs para cada entrada
  public inputType_2: string = 'password';
  public idUser: number = 0;
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public editar:boolean = false;
  //public posgradoFlag:boolean = false;

public carrera: any[] = [
  { value: '1', viewValue: 'Ingeniería en Ciencias de la Computación' },
  { value: '2', viewValue: 'Ingeniería en Tecnologías de la Información' },
  { value: '3', viewValue: 'Licenciatura en Ciencias de la Computación' },
];

public posgrado: any[] = [
  { value: '1', viewValue: 'Maestría en Ciencias de la Computación' },
  { value: '2', viewValue: 'Doctorado en Ciencias de la Computación' },
];


 public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  public sexo: any[] = [
    { value: 'masculino', viewValue: 'Masculino' },
    { value: 'femenino', viewValue: 'Femenino' },
    { value: 'prefiero_no_decir', viewValue: 'Prefiero no decir' },
  ];

  public campus: any[] = [
    { value: '1', viewValue: 'CU San Manuel' },
    { value: '2', viewValue: 'CU2 Valsequillo' },
  ];

  public sueldoFocused: boolean = false;

constructor(
    private location: Location,
    private router: Router,
    private alumnoService: AlumnoService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    //Primero validamos si existe un rol y un id, si es así, estamos en modo edición y cargamos los datos del usuario a editar
    if(this.activatedRoute.snapshot.params['id'] !== undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      //Asignamos los datos del usuario que vienen desde la vista principal con el decorador
      this.alumno = this.datos_user;
    }else{
      // Si no va a editar, entonces inicializamos el JSON para registro nuevo
    this.alumno = this.alumnoService.esquemaAlumno();
    this.alumno.rol = this.rol;
  }  
  }



  public showPassword()
  {
    if(this.inputType_1 === 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }


  public showPwdConfirmar()
  {
    if(this.inputType_2 === 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public revisarSeleccion(nombre: string){
    if(this.alumno.materias_json){
      const busqueda = this.alumno.materias_json.find((element: string)=>element===nombre);
      if(busqueda !== undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
  }


  public regresar(){
    this.location.back();
  }

  private normalizeFechaNacimiento(): void {
    const rawFecha = this.alumno?.fecha_nacimiento;

    if (typeof rawFecha !== 'string') {
      return;
    }

    const fecha = rawFecha.trim();
    const parts = fecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!parts) {
      return;
    }

    const day = parts[1].padStart(2, '0');
    const month = parts[2].padStart(2, '0');
    const year = parts[3];
    this.alumno.fecha_nacimiento = `${year}-${month}-${day}`;
  }

  public registrar(){
    //Inicializo el objeto de errores para evitar que se muestren errores anteriores o datos anteriores al momento de registrar un nuevo alumno
    this.errors = {};
    console.log("Datos del alumno: ", this.alumno);

    this.normalizeFechaNacimiento();

    // Validar datos y mostrar errores
    this.errors = this.alumnoService.validarAlumno(this.alumno, this.editar);
    //Verificamos si el objeto de errores está vacío, lo que indica que no hay errores de validación
    if(Object.keys(this.errors).length > 0){
      return;
    }

    // Validar si las contraseñas coinciden solo si no se está editando, ya que en la edición no es obligatorio cambiar la contraseña
    if(this.alumno.password === this.alumno.confirmar_password){
      // TODO: Aquí iría la lógica para registrar al alumno, como llamar a un servicio que se encargue de hacer la petición al backend
      this.alumnoService.registrarAlumno(this.alumno).subscribe({
        next: (response) => {
          this.notificationService.success("Alumno registrado exitosamente");
          console.log(response);
          //Si se registra correctamente, redirigimos al login
          this.router.navigate(['']);
        },
        error: (error) => {
          console.error("Error al registrar alumno: ", error);
          this.notificationService.error("Error al registrar alumno");
        }
      });
    }else{
      this.notificationService.error("Las contraseñas no coinciden");
      this.alumno.password="";
      this.alumno.confirmar_password="";
    }

  }

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.alumnoService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }
    // Llamamos a la función para actualizar al alumno, esta función se encuentra en el servicio de alumnos
    this.alumnoService.actualizarAlumno(this.alumno).subscribe({
      next: (response) => {
        this.notificationService.success("Alumno actualizado exitosamente");
        console.log(response);
        //Si se actualiza correctamente, redirigimos al login
        this.router.navigate(['/alumno']);
      },
      error: (error) => {
        console.error("Error al actualizar alumno: ", error);
        this.notificationService.error("Error al actualizar alumno");
      }
    });



  }


  public checkboxChange(event:any){
    if(event.checked){
      this.alumno.materias_json.push(event.source.value)
    }else{
      this.alumno.materias_json.forEach((materia: any, i: any) => {
        if(materia === event.source.value){
          this.alumno.materias_json.splice(i,1)
          //El splice es un método de los arrays que permite eliminar elementos, en este caso, elimina 1 elemento en la posición i, que es el índice del elemento que queremos eliminar
        }
      });
    }
  }

  // Función para los campos solo de datos alfabeticos
  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }
}

