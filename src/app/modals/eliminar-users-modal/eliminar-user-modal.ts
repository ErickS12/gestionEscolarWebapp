import { Component, Inject, OnInit } from '@angular/core';
import { AdministradoresService } from '../../services/administradores-service';
import { AlumnoService } from '../../services/alumnos-service';
import { MaestrosService } from '../../services/maestros-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '../../services/tools/notification-service';

@Component({
  selector: 'app-eliminar-user-modal',
  imports: [],
  templateUrl: './eliminar-user-modal.html',
  styleUrl: './eliminar-user-modal.scss',
})
export class EliminarUserModal implements OnInit{
  public rol: string = "";

  constructor(
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnoService: AlumnoService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<EliminarUserModal>,
    @Inject (MAT_DIALOG_DATA) public data: any 
    //MatDialogData es un tipo que se puede definir para especificar la estructura de los datos que se pasan al modal, en este caso se espera un objeto con las propiedades id y rol para identificar al usuario a eliminar y su tipo (administrador, maestro o alumno).
    //necestiamos inyectar el id y el rol del usuario a eliminar para saber que servicio usar y que id eliminar
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol;  
    //accedemos al json que se pasa al modal desde el componente que lo abre, en este caso se espera que tenga una propiedad rol que indique el tipo de usuario a eliminar (administrador, maestro o alumno) y se asigna a la variable rol para usarla en la lógica de eliminación.
  }

  public cerrar_modal(){
    this.dialogRef.close({isDelete:false});
  }

  public eliminarUser(){
    if(this.rol === 'administrador'){
      // Lógica para eliminar administrador usando path
      this.administradoresService.desactivarAdmin(this.data.id).subscribe({
        next: (response) => {
          console.log('Administrador eliminado:', response);
          this.notificationService.success('Administrador eliminado exitosamente');
          this.dialogRef.close({isDelete:true});
        },
        error: (error) => {
          console.error('Error al eliminar administrador:', error);
          this.notificationService.error('Error al eliminar administrador');
        }
      });

    }else if(this.rol === 'maestro'){
      // Lógica para eliminar maestro usando delete
      this.maestrosService.eliminarMaestro(this.data.id).subscribe({
        next: (response) => {
          console.log('Maestro eliminado:', response);
          this.notificationService.success('Maestro eliminado exitosamente');
          this.dialogRef.close({isDelete:true});
        },
        error: (error) => {
          console.error('Error al eliminar maestro:', error);
          this.notificationService.error('Error al eliminar maestro');
        }
      });

    }else if(this.rol === 'alumno'){
      // Lógica para eliminar alumno usando delete
      this.alumnoService.eliminarAlumno(this.data.id).subscribe({
        next: (response) => {
          console.log('Alumno eliminado:', response);
          this.notificationService.success('Alumno eliminado exitosamente');
          this.dialogRef.close({isDelete:true});
        },
        error: (error) => {
          console.error('Error al eliminar alumno:', error);
          this.notificationService.error('Error al eliminar alumno');
        }
      });
    }
  }

}