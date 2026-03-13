package com.es2.composite;

import java.util.ArrayList;

public class SubMenu extends Menu {
    private final ArrayList<Menu> subMenu = new ArrayList<>();
    public SubMenu(){}
    public void addChild(Menu child){
        subMenu.add(child);
    }
    public void removeChild(Menu child){
        subMenu.remove(child);
    }
    public void showOptions(){
        System.out.println(getLabel());
        for (Menu menuInSubMenus : subMenu)
        {
            menuInSubMenus.showOptions();
        }
    }
}
