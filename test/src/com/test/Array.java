package com.test;

public class Array {

	public static void main(String[] args) {
		
		int arr[]= {1,3,4,5,5,2,9,12};
		int min=arr[0];
		int max=arr[0];
		for(int i=1;i<arr.length;i++)
		{
			if(arr[i]<min)
			{
				min=arr[i];
			}
			if(arr[i]>max)
			{
				max=arr[i];
			}
			
		}
		System.out.println(min);
		System.out.println(max);
		

	}

}
