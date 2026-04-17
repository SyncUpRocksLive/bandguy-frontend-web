import type { Meta, StoryObj } from '@storybook/react';
import {MemoryRouter} from 'react-router';
import TopNavBar from '../Components/Header/TopNavBar';

const meta = {
	title: 'Navigation/TopNavBar',
	component: TopNavBar,
	tags: ['autodocs'],
	parameters: {
		// More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
		layout: 'fullscreen',
	},
	decorators : [(Story) => (<MemoryRouter><Story/></MemoryRouter>)]
} satisfies Meta<typeof TopNavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
	args: {
		user: {
		name: 'Jane Doe',
		},
	},
};

export const LoggedOut: Story = {};
