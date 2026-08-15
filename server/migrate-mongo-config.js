import 'dotenv/config'

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/catvac',
    databaseName: 'catvac',
  },
  migrationsDir: 'migrations',
  changelogCollectionName: '_migrations',
  migrationFileExtension: '.js',
}

export default config
