import {Config} from '@remotion/cli/config';
import render from './framework/config/render.json';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setBrowserExecutable(render.browserExecutable);
Config.setConcurrency(render.concurrency);
Config.setChromiumOpenGlRenderer(render.gl as any);
