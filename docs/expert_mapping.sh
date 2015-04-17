curl -XPUT http://localhost:9200/users -d '
{
  "mappings" : {
    "user" : {
      "_id" : { "path" : "id" },
      "_timestamp" : { "enabled" : true, "store" : true },
      "properties" : {
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
        "age" : { "type" : "integer" },
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
        "price" : {
          "type" : "object",
          "properties" : {
            "phone_enable" : { "type" : "boolean" },
            "phone_amount" : { "type" : "integer" },
            "email_enable" : { "type" : "boolean" },
            "email_amount" : { "type" : "integer" },
            "message_enable" : { "type" : "boolean" },
            "message_amount" : { "type" : "integer" },
            "interview_enable" : { "type" : "boolean" },
            "interview_amount" : { "type" : "integer" },
            "min_amount" : { "type" : "integer" },
            "max_amount" : { "type" : "integer" },
            "enable_list" : { "type" : "string", "index" : "not_analyzed" }
          }
        }
      }
    }
  }
}'
