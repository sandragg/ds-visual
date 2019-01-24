import 'whatwg-fetch';
import { Structure } from 'src/services/interface';

export class StructureModel {
	public static EXTENDED_API_PATH: string = 'extended-structures.json';
	public static API_PATH: string = 'structures.json';

	public static getList(isExtended: boolean): Promise<Structure[]> {
		return fetch(isExtended ? StructureModel.EXTENDED_API_PATH : StructureModel.API_PATH)
			.then(res => res.json())
			.catch(err => [err])
	}

	public static getOne(id: number, isExtended: boolean): Promise<Structure> {
		return fetch(isExtended ? StructureModel.EXTENDED_API_PATH : StructureModel.API_PATH)
			.then(res => res.json())
			.then(structureList => structureList.find(struct => struct.id === id))
			.catch(err => [err]);
	}
}
