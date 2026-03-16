// models/User.js
const db = require('../config/connection.js'); // Import knex instance
var bcrypt = require("bcrypt");

class Setting {
  // Constructor to set initial values or configuration
  constructor(data = null) {
    
  }

  // Create a new user
  static async addEditData(settings,userId) {


    const settingsArray = Object.entries(settings);

    for (let [key, value] of settingsArray) {
      try {
           // Check if the setting_key already exists for the user
          const existingSetting = await db('settings')
            .where({ user_id: userId, setting_key: key })
            .first();  // Get the first matching record

          if (existingSetting) {
            // If the setting exists, update the setting_value
            await db('settings')
              .where({ user_id: userId, setting_key: key })
              .update({ setting_value: value });

            console.log(`Updated setting ${key} with value ${value}`);
          } else {

            // If the setting doesn't exist, insert a new setting
            await db('settings')
              .insert({
                user_id: userId,
                setting_key: key,
                setting_value: value
              });

            console.log(`Inserted new setting ${key} with value ${value}`);
          }
      } catch (error) {
        console.error(`Error upserting setting ${key}:`, error);
      }
    }
    // const [user] = await db('users').insert(data).returning('*');
     return true;
  }
  static async getSettings() {
    const settings = await db('settings').whereNull('deleted_at').select('*');
    return settings.map(setting => setting);
  }

  static async getSettingByKey(key) {
      try {
        const setting = await db('settings').where({ setting_key: key }).first();
        if(setting && setting.setting_value){
          return setting.setting_value;
        }
        return null;
      } catch (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return null;
      }
  }

  // Update a user by ID
  // static async update(id, data) {
  //   const [user] = await db('users')
  //     .where({ id })
  //     .update(data)
  //     .returning('*');
  //   return new User(user);
  // }

}

module.exports = Setting;
