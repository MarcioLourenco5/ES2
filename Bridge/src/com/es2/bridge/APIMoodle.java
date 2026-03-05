package com.es2.bridge;

import java.util.LinkedHashMap;
import java.util.Map;

public class APIMoodle implements APIServiceInterface{ // ConcreteImplementor: Implementa “como” se guarda e se obtém conteúdo.

    protected LinkedHashMap<String, String> content = new LinkedHashMap<>();

    public APIMoodle(){

    }

    public String getContent(String contentId){
        if(contentId.equals("0")){
            String result = "";
            for(Map.Entry<String, String> contentString : this.content.entrySet()){
                result = result.concat(contentString.getValue());
            }
            return result;
        }
        else{
            return this.content.get(contentId);
        }
    }

    public String setContent(String content){
        String hashMapSize = String.valueOf(this.content.size());
        this.content.put(hashMapSize, content);
        return hashMapSize;
    }
}
