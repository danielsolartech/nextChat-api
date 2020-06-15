import 'module-alias/register';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import NextChat from '@NextChat';

dotenv.config();

try {
  NextChat.initialize();
} catch (error) {
  console.error(error);
}
