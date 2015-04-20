curl -XPUT http://localhost:9200/users -d '
{
  "mappings" : {
    "user" : {
      "_id" : { "path" : "id" },
      "_timestamp" : { "enabled" : true, "store" : true },
      "properties" : {
        "register_date" : { "type" : "date" },
        "register_done" : { "type" : "boolean" },
        "signin_step" : { "type" : "integer" },
        "type" : { "type" : "string", "index" : "not_analyzed" },
        "id" : { "type" : "string", "index" : "no" },
        "passwd" : { "type" : "string", "index" : "no" },
        "user_photo" : { "type" : "string", "index" : "no" },
        "name" : { "type" : "string", "index" : "not_analyzed" },
        "gender" : { "type" : "string", "index" : "not_analyzed" },
        "birth" : {
          "type" : "object",
          "properties" : {
            "year" : { "type" : "string", "index" : "no" },
            "month" : { "type" : "string", "index" : "no" },
            "day" : { "type" : "string", "index" : "no" }
          }
        },
        "birthday" : { "type" : "date" },
        "phone" : { "type" : "string", "index" : "not_analyzed" },
        "email" : { "type" : "string", "index" : "not_analyzed" },
        "homepage" : { "type" : "string", "index" : "not_analyzed" },
        "naver_line" : { "type" : "string", "index" : "not_analyzed" },
        "facebook" : { "type" : "string", "index" : "not_analyzed" },
        "twitter" : { "type" : "string", "index" : "not_analyzed" },
        "googleplus" : { "type" : "string", "index" : "not_analyzed" },
        "linkedin" : { "type" : "string", "index" : "not_analyzed" },
        "instagram" : { "type" : "string", "index" : "not_analyzed" },
        "category_list" : {
          "type" : "object",
          "properties" : {
            "name" : { "type" : "string", "index" : "no" },
            "comment" : { "type" : "string", "index" : "no" },
            "checked" : { "type" : "boolean", "index" : "no" },
            "style" : {
              "type" : "object",
              "properties" : {
                "color" : { "type" : "string", "index" : "no" },
                "background-color" : { "type" : "string", "index" : "no" }
              }
            }
          }
        },
        "category" : {
          "type" : "string", "index" : "not_analyzed",
          "fields" : { "indexed" : { "type" : "string", "analyzer" : "standard" } }
        },
        "expert_type" : { "type" : "string", "index" : "not_analyzed" },
        "location" : { "type" : "string", "index" : "not_analyzed" },
        "career" : { "type" : "string" },
        "activity" : { "type" : "string" },
        "profile_title" : { "type" : "string" },
        "profile_text" : { "type" : "string", "boost" : 0.3 },
        "proflie_txt_color" : { "type" : "boolean" },
        "proflie_txt_location" : { "type" : "string", "index" : "no" },
        "profile_text" : { "type" : "string" },
        "profile_bg_img" : { "type" : "string", "index" : "no" },
        "method_list" : {
          "type" : "object",
          "properties" : {
            "name" : { "type" : "string", "index" : "no" },
            "price" : { "type" : "integer", "index" : "no" },
            "unit" : { "type" : "string", "index" : "no" },
            "checked" : { "type" : "boolean", "index" : "no" }
          }
        },
        "method" : {
          "type" : "string", "index" : "not_analyzed",
          "fields" : { "indexed" : { "type" : "string", "analyzer" : "standard" } }
        },
        "method_price_min" : { "type" : "integer" },
        "method_price_max" : { "type" : "integer" }
      }
    }
  }
}'
