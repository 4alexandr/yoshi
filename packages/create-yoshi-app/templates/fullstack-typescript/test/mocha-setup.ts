import axios from 'axios';
import { wixAxiosConfig } from 'wix-axios-config';
import { baseURL } from './test-common';

/*
hack start
axios + jsdom has a bug "Error: Cross origin null forbidden".
"jsdom-global/register" will add global XMLHttpRequest and axios try to use it instead of default "http" adapter.
To fix it - axios(and all dependencies with their own axios) should be imported before jsdom
 */
import 'wix-hadron-testkit';
import 'jsdom-global/register';
/* hack end */

wixAxiosConfig(axios, { baseURL });
