import { Observable } from "rxjs";
import { ENV } from "../env";
import { HTTPService } from "./http.service";

export class ResourceService extends HTTPService {
  private readonly api: string | undefined = ENV.api;

  getResources(): Observable<Response | { error: boolean; message: any }> {
    return this.get(this.api + "/resource");
  }
  register(
    request: ResourceService.RegisterResourceRequest
  ): Observable<Response | { error: boolean; message: any }> {
    return this.post(this.api + "/resource/register", request);
  }
  deleteResource(
    request: ResourceService.RemoveResourceRequest
  ): Observable<Response | { error: boolean; message: any }> {
    return this.delete(this.api + "/resource", request);
  }
  addMemberResource(
    request: ResourceService.AddMemberResourceRequest
  ): Observable<Response | { error: boolean; message: any }> {
    return this.post(this.api + "/resource/member", request);
  }
  removeMemberResource(
    request: ResourceService.RemoveMemberResourceRequest
  ): Observable<Response | { error: boolean; message: any }> {
    return this.delete(this.api + "/resource/member", request);
  }
  updateResource(
    request: ResourceService.UpdateResourceRequest
  ): Observable<Response | { error: boolean; message: any }> {
    return this.put(this.api + "/resource", request);
  }
}

export namespace ResourceService {
  export interface RegisterResourceRequest {
    address: string;
    name: string;
  }
  export interface UpdateResourceRequest {
    address: string;
    id: number;
    name: string;
  }
  export interface RemoveResourceRequest {
    id: number;
  }
  export interface AddMemberResourceRequest {
    email: string;
    resourceID: number;
  }

  export interface RemoveMemberResourceRequest {
    email: string;
    resourceID: number;
  }
  export interface ResourceResponse {
    address: string;
    id: number;
    name: string;
  }
  export enum ResourceStatus {
    good = 0,
    outOfDate = 1,
    offline = 2,
  }
}
