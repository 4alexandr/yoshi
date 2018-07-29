import 'wix-hadron-testkit';
import axios from 'axios';
import { wixAxiosConfig } from 'wix-axios-config';
import 'jsdom-global/register';

import { baseURL } from './test-common';

wixAxiosConfig(axios, { baseURL });
