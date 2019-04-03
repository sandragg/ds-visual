import { ModelAction } from 'src/services/interface';

export const StackInterface: ModelAction[] = [
	{
		name: 'Push',
		method: 'push',
		mutable: true
	},
	{
		name: 'Pop',
		method: 'pop',
		mutable: true
	},
	{
		name: 'Top',
		method: 'top',
		mutable: false
	},
	{
		name: 'Reset',
		method: 'erase',
		mutable: true
	},
	{
		name: 'Empty',
		method: 'empty',
		mutable: false
	},
	{
		name: 'Full',
		method: 'full',
		mutable: false
	}
];
