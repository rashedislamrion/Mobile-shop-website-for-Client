import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getHealth(): {
        status: string;
        uptime: number;
        timestamp: string;
        service: string;
        environment: string;
    };
}
