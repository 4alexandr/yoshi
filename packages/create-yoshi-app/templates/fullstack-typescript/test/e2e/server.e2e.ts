import { expect } from 'chai';
import axios from 'axios';
import * as adapter from 'axios/lib/adapters/http';
import { env } from './e2e-common';
import { baseURL } from '../test-common';
import { wixAxiosInstanceConfig } from 'wix-axios-config';

const axiosInstance = wixAxiosInstanceConfig(axios, { baseURL, adapter });

describe('When rendering', () => {

  it('should display a title', async () => {
    const url = env.app.getUrl('/');
    const response = await axiosInstance.get(url);

    expect(response.data).to.contain('Wix Full Stack Project Boilerplate');
  });

});
