(prodigy-define-service
  :name "wpp"
  :command "nodemon"
  :args '("--debug" "main")
  :cwd "/Users/akatovda/Documents/Stuff/wpp/"
  :stop-signal 'kill
  :kill-signal 'sigkill
  :kill-process-buffer-on-stop t)

(provide 'wpp)
