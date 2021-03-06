#curl -XDELETE http://localhost:9200/users
curl -XPUT http://localhost:9200/users -d '
{
  "mappings" : {
    "user" : {
      "_id" : { "path" : "id" },
      "_timestamp" : { "enabled" : true, "store" : true },
      "properties" : {
        "register_date" : { "type" : "date" },
        "verified" : { "type" : "boolean" },
        "id" : { "type" : "string", "index" : "no" },
        "passwd" : { "type" : "string", "index" : "no" },
        "email" : { "type" : "string", "index" : "no" },
        "name" : { "type" : "string", "index" : "no" },
        "nicname" : { "type" : "string", "index" : "no" },
        "gender" : { "type" : "string", "index" : "not_analyzed" },
        "birthday" : { "type" : "date" },
        "phone" : { "type" : "string", "index" : "no" },
        "jjim" : { "type" : "string", "index" : "not_analyzed" },
        "messages" : { "type" : "string", "index" : "not_analyzed" }
      }
    }
  }
}'
