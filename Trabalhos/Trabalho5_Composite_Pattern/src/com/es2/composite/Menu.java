package com.es2.composite;

public abstract class Menu extends Object {

    private String label = "";
    public Menu(){

    }
    public String getLabel(){
        return this.label;
    }
    public void setLabel(String label){
        this.label = label;
    }
    public abstract void showOptions();
}
