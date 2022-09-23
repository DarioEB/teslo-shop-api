import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

import { Server, Socket } from 'socket.io';

import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';

import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  /* El decorador provee la información de todos los clientes conectados */
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) { }

 async handleConnection(client: Socket) {
    const token = client.handshake.headers.auth as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload);
    } catch (error) {
      /* Si existe un error de autenticación, se desconecta el cliente */
      client.disconnect();
      return;
    }
    // console.log('Cliente conectado: ', client.id);

    // console.log('Cantidad de clientes conectados',
    //   this.messagesWsService.getConnectedClients())

    /* El nombre del evento el clave */
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado', client.id);
    this.messagesWsService.removeClient(client.id)

    console.log('Cantidad de clientes conectados',
      this.messagesWsService.getConnectedClients())


    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  // message-form-client
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {

    //! Emite unicamente al cliente.
    // client.emit('message-form-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message'
    // });

    //! Emitir a todos menos, al cliente inicial
    // client.broadcast.emit('message-form-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message'
    // });

    this.wss.emit('message-form-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'sin-mensaje'
    })
  }

}
