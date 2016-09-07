(prodigy-define-service
  :name "wpp"
  ;; :command "node"
  ;; :args '("wpp")
  :command "nodemon"
  :args '("--debug" "wpp")
  :cwd "/Users/akatovda/Documents/Stuff/wpp/"
  :stop-signal 'kill
  :kill-signal 'sigkill
  :kill-process-buffer-on-stop t)

(defvar wpp-job-name)
(defvar wpp-conf-path)
(defvar wpp-sources)
(defvar old-wpp-sources)
(defvar new-wpp-sources)

(setq wpp-conf-path "~/Documents/Stuff/wpp/configs/")
(defun wpp-get-sources ()
  (defun wpp-trim-json (str)
    (subseq str 0 (- (length str) 5)))

  (mapcar 'wpp-trim-json (directory-files wpp-conf-path nil ".*\.json")))

(setq wpp-sources (wpp-get-sources))

(defun wpp-send-config (config)
  (if (not (equal config "__tank__"))
      (let* ((bpr-process-directory wpp-conf-path)
             (bpr-show-progress nil)
             (bpr-close-after-success t))
        (bpr-spawn
         (concat "curl -H 'Content-Type: application/json' --data @" config ".json http://localhost:8283/ -o /tmp/" config ".json")))))

(defun wpp-send ()
  (interactive)

  (setq new-wpp-sources (apply #'concat (wpp-get-sources)))
  (if (not (equal new-wpp-sources old-wpp-sources))
      (setq wpp-sources (wpp-get-sources)))
  (setq old-wpp-sources new-wpp-sources)

  (setq wpp-job-name (ido-completing-read "Run WebpageProcessor job: " wpp-sources))
  (delete wpp-job-name wpp-sources)
  (add-to-list 'wpp-sources wpp-job-name)

  (if (equal wpp-job-name "__tank__")
      (wpp-tank)
    (wpp-send-config wpp-job-name))
  (switch-to-buffer "*prodigy-wpp*"))
(bind-key "C-x RET" 'wpp-send)

(defun wpp-tank ()
  (interactive)
  (mapcar 'wpp-send-config (wpp-get-sources)))

(provide 'wpp)
