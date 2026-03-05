package com.es2.bridge;

import java.util.HashMap;

public class APIRequest {

    protected HashMap<String, APIServiceInterface> services = new HashMap<>();

    public APIRequest(){}

    public String addService(APIServiceInterface service){
        String newEntryId = String.valueOf(services.size());
        services.put(newEntryId, service);
        return newEntryId;
    }

    public String getContent(String serviceId, String contentId) throws ServiceNotFoundException{
        APIServiceInterface api = services.get(serviceId);
        if(api == null){
            throw new ServiceNotFoundException();
        }
        return api.getContent(contentId);
    }

    public String setContent(String serviceId, String content) throws ServiceNotFoundException{
        APIServiceInterface api = services.get(serviceId);
        if(api == null){
            throw new ServiceNotFoundException();
        }
        return api.setContent(content);
    }

}
