import 'whatwg-fetch';
import { Structure } from 'src/services/interface';

export class StructureModel {
	public static API_PATH: string = 'structures.json';

	public static getList(): Promise<Structure[]> {
		return fetch(StructureModel.API_PATH)
			.then(res => res.json())
			.catch(err => [err]);
	}

	public static getOne(id: number): Promise<Structure> {
		return fetch(StructureModel.API_PATH)
			.then(res => res.json())
			.then(structureList => structureList.find(struct => struct.id === id))
			.catch(err => [err]);
	}
}
