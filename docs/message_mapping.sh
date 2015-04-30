curl -XDELETE http://localhost:9200/messages
curl -XPUT http://localhost:9200/messages -d '
{
  "mappings" : {
    "_default_" : {
      "_timestamp" : { "enabled" : true, "store" : true },
      "properties" : {
        "user_id" : { "type" : "string", "index" : "not_analyzed" },
        "name" : { "type" : "string", "index" : "not_analyzed" },
        "nicname" : { "type" : "string", "index" : "not_analyzed" },
        "phone" : { "type" : "string", "index" : "no" },
        "user_sent" : { "type" : "boolean" },
        "send_time" : { "type" : "date" },
        "read_time" : { "type" : "date" },
        "message" : { "type" : "string", "index" : "no" }
        }
      }
    }
  }
}'
