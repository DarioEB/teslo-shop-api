import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Socket } from 'socket.io';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { JwtPayload } from '../auth/interfaces';

interface ConnectedClients {
  [id: string]: {
    socket: Socket,
    user: User
  };
}

@Injectable()
export class MessagesWsService {

  private connectedClients: ConnectedClients = {}

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async registerClient(client: Socket, payload: JwtPayload) {
    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');

    this.checkUserConnection(user);

    /* Asigno el id de conexión con el cliente conectado */
    this.connectedClients[client.id] = {
      socket: client,
      user,
    }
  }

  removeClient(clientId: string) {
    /* Eliminación del cliente por ID */
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    let clients = Object.keys(this.connectedClients);
    return clients;
  }

  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName
  }

  private checkUserConnection(user: User) {

    /* Barremos todos los socket-id's de los usuarios conectados */
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];
      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }

  }
}
