import dotenv from 'dotenv';
import {connectMongo} from './config/db';
import AiModel from './models/aiModel';
import { aiModels } from './data/aiModels';

dotenv.config();
connectMongo();

const importData = async () => {
  try {
    await AiModel.deleteMany();

    await AiModel.insertMany(aiModels);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await AiModel.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

// Check for command line arguments to decide what to do
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}