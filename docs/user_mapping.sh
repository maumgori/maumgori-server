curl -XPUT http://localhost:9200/users -d '
{
  "mappings" : {
    "user" : {
      "_id" : { "path" : "email" },
      "_timestamp" : { "enabled" : true, "store" : true },
      "properties" : {
        "register_date" : { "type" : "date" },
        "email" : { "type" : "string", "index" : "no" },
        "email_verified" : { "type" : "boolean" },
        "passwd" : { "type" : "string", "index" : "no" },
        "name" : { "type" : "string", "index" : "no" },
        "nicname" : { "type" : "string", "index" : "no" },
        "gender" : { "type" : "string", "index" : "not_analyzed" },
        "birthday" : { "type" : "date" },
        "phone" : { "type" : "string", "index" : "no" }
      }
    }
  }
}'
