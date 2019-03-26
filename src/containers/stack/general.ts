import { ModelAction } from 'src/services/interface';

export const StackInterface: ModelAction[] = [
	{
		name: 'Push',
		method: 'push',
		handler: 'onInsertUpdate'
	},
	{
		name: 'Pop',
		method: 'pop',
		handler: 'onInsertUpdate'
	},
	{
		name: 'Top',
		method: 'top',
		handler: 'onInsertUpdate'
	},
	{
		name: 'Reset',
		method: 'erase',
		handler: 'onInsertUpdate'
	},
	{
		name: 'Empty',
		method: 'empty',
		handler: 'onInsertUpdate'
	},
	{
		name: 'Full',
		method: 'full',
		handler: 'onInsertUpdate'
	},
];
